import { PrismaClient, AnchorStatus } from '@prisma/client';
import { sendBsvOpReturn } from '../utils/bsv';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Anchor worker that polls for PENDING events and anchors them to BSV
 * Run this as a separate process: npm run worker
 */
async function anchorPendingEvents() {
  console.log('Checking for pending events to anchor...');

  try {
    // Fetch all PENDING events
    const pendingEvents = await prisma.deviceEvent.findMany({
      where: { anchorStatus: AnchorStatus.PENDING },
      take: 10, // Process in batches
      orderBy: { timestamp: 'asc' },
    });

    if (pendingEvents.length === 0) {
      console.log('No pending events to anchor.');
      return;
    }

    console.log(`Found ${pendingEvents.length} pending events to anchor.`);

    for (const event of pendingEvents) {
      try {
        // Send SHA-256 hash to BSV blockchain via OP_RETURN
        const bsvTxId = await sendBsvOpReturn(event.sha256);

        // Update event with BSV transaction ID and status
        await prisma.deviceEvent.update({
          where: { id: event.id },
          data: {
            bsvTxId,
            anchorStatus: AnchorStatus.SENT,
          },
        });

        console.log(`Anchored event ${event.id} with BSV txid: ${bsvTxId}`);
      } catch (error) {
        console.error(`Failed to anchor event ${event.id}:`, error);

        // Mark as FAILED
        await prisma.deviceEvent.update({
          where: { id: event.id },
          data: {
            anchorStatus: AnchorStatus.FAILED,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error in anchor worker:', error);
  }
}

// Run worker in a loop
async function runWorker() {
  console.log('BSV Anchor Worker started');
  console.log('Polling interval: 30 seconds');

  while (true) {
    await anchorPendingEvents();
    // Wait 30 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}

// Start the worker
runWorker()
  .catch((e) => {
    console.error('Worker error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
