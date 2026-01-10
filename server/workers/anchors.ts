import { PrismaClient } from '@prisma/client';
import { anchorToBSV } from '../utils/bsv';
import { createDataHash, sleep } from '../utils';

const prisma = new PrismaClient();

/**
 * Anchor Worker
 * 
 * This worker periodically processes pending DeviceEvents and anchors them to BSV blockchain.
 * It batches events and creates anchor jobs for efficient processing.
 */

const BATCH_SIZE = 10; // Number of events to process in one batch
const POLL_INTERVAL = 5000; // Poll every 5 seconds

let isRunning = false;

export async function startAnchorWorker() {
  if (isRunning) {
    console.log('[Anchor Worker] Already running');
    return;
  }

  isRunning = true;
  console.log('[Anchor Worker] Started');

  while (isRunning) {
    try {
      await processAnchorJobs();
      await processPendingEvents();
    } catch (error) {
      console.error('[Anchor Worker] Error:', error);
    }

    await sleep(POLL_INTERVAL);
  }
}

export function stopAnchorWorker() {
  isRunning = false;
  console.log('[Anchor Worker] Stopped');
}

/**
 * Process existing anchor jobs
 */
async function processAnchorJobs() {
  const pendingJobs = await prisma.anchorJob.findMany({
    where: {
      status: 'pending',
    },
    take: 5,
  });

  for (const job of pendingJobs) {
    try {
      await prisma.anchorJob.update({
        where: { id: job.id },
        data: { status: 'processing' },
      });

      const eventIds = JSON.parse(job.eventIds);
      const events = await prisma.deviceEvent.findMany({
        where: {
          id: { in: eventIds },
        },
      });

      // Create hash of all events for anchoring
      const dataHash = createDataHash(events);
      
      // Anchor to BSV
      const result = await anchorToBSV(dataHash);

      if (result.success && result.txid) {
        // Update job
        await prisma.anchorJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            bsvTxId: result.txid,
          },
        });

        // Update all events in this batch
        await prisma.deviceEvent.updateMany({
          where: {
            id: { in: eventIds },
          },
          data: {
            anchorStatus: 'anchored',
            bsvTxId: result.txid,
          },
        });

        console.log(`[Anchor Worker] Anchored ${eventIds.length} events with txid: ${result.txid}`);
      } else {
        await prisma.anchorJob.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            error: result.error || 'Unknown error',
          },
        });

        await prisma.deviceEvent.updateMany({
          where: {
            id: { in: eventIds },
          },
          data: {
            anchorStatus: 'failed',
          },
        });
      }
    } catch (error) {
      console.error('[Anchor Worker] Error processing job:', error);
      await prisma.anchorJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

/**
 * Process pending device events and create anchor jobs
 */
async function processPendingEvents() {
  const pendingEvents = await prisma.deviceEvent.findMany({
    where: {
      anchorStatus: 'pending',
    },
    take: BATCH_SIZE,
    orderBy: {
      timestamp: 'asc',
    },
  });

  if (pendingEvents.length === 0) {
    return;
  }

  const eventIds = pendingEvents.map(e => e.id);

  // Create anchor job
  await prisma.anchorJob.create({
    data: {
      eventIds: JSON.stringify(eventIds),
      status: 'pending',
    },
  });

  console.log(`[Anchor Worker] Created anchor job for ${eventIds.length} events`);
}
