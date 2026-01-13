import { PrismaClient, AnchorStatus } from '@prisma/client';
import { sendBsvOpReturn } from '../utils/bsv';

const prisma = new PrismaClient();

export async function startAnchorWorker() {
  console.log('Starting BSV anchor worker...');

  // Process pending events every 30 seconds
  setInterval(async () => {
    try {
      await processUnanchoredEvents();
    } catch (error) {
      console.error('Error in anchor worker:', error);
    }
  }, 30000);

  // Process immediately on startup
  await processUnanchoredEvents();
}

async function processUnanchoredEvents() {
  const pendingEvents = await prisma.deviceEvent.findMany({
    where: {
      anchorStatus: AnchorStatus.PENDING,
      bsvTxId: null,
    },
    take: 10, // Process 10 at a time
  });

  if (pendingEvents.length === 0) {
    return;
  }

  console.log(`Processing ${pendingEvents.length} pending events for anchoring`);

  for (const event of pendingEvents) {
    try {
      // Send SHA256 hash to BSV blockchain via OP_RETURN
      const txId = await sendBsvOpReturn(event.sha256);

      // Update event with txId and anchor status
      await prisma.deviceEvent.update({
        where: { id: event.id },
        data: {
          bsvTxId: txId,
          anchorStatus: AnchorStatus.ANCHORED,
        },
      });

      console.log(`Anchored event ${event.id} with txId: ${txId}`);
    } catch (error) {
      console.error(`Failed to anchor event ${event.id}:`, error);

      // Mark as failed
      await prisma.deviceEvent.update({
        where: { id: event.id },
        data: {
          anchorStatus: AnchorStatus.FAILED,
        },
      });
    }
  }
}
