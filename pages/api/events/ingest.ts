import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db/prisma';
import { computeHash } from '@/lib/bsv/transaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId, timestamp, metrics, alertType, rawPayload } = req.body;

    if (!deviceId || !timestamp || !metrics) {
      return res.status(400).json({ error: 'deviceId, timestamp, and metrics are required' });
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: { owner: true },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Compute event hash
    const eventData = { deviceId, timestamp, metrics, alertType, rawPayload };
    const eventHash = computeHash(eventData);

    // Create device event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        timestamp: new Date(timestamp),
        alertType: alertType || 'none',
        metrics: JSON.stringify(metrics),
        rawPayload: JSON.stringify(rawPayload || eventData),
        eventHash,
      },
    });

    // Check if owner has granted consent to any operators
    const consents = await prisma.consent.findMany({
      where: {
        customerId: device.ownerId,
        granted: true,
      },
    });

    // Queue BSV anchor for this event (create pending transaction record)
    await prisma.bSVTransaction.create({
      data: {
        eventId: event.id,
        dataHash: eventHash,
        status: 'pending',
        network: process.env.BSV_NETWORK || 'testnet',
      },
    });

    // Emit socket event for realtime updates (if socket server is running)
    // This will be handled by the Socket.IO server
    console.log('Event ingested:', event.id, 'Hash:', eventHash);

    return res.status(201).json({ 
      event: {
        id: event.id,
        deviceId: device.deviceId,
        timestamp: event.timestamp,
        alertType: event.alertType,
        eventHash: event.eventHash,
      },
      sharedWith: consents.length,
    });
  } catch (error: any) {
    console.error('Event ingestion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
