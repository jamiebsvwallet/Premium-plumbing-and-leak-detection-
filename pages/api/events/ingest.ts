import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { createHash } from '@/lib/bsv';
import { io } from '@/server/socket-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId, timestamp, metrics, alertType, rawPayload } = req.body;

    if (!deviceId || !timestamp || !metrics) {
      return res.status(400).json({ 
        error: 'deviceId, timestamp, and metrics are required' 
      });
    }

    // Find the device
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: { owner: true },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Create event hash for BSV anchoring
    const eventData = JSON.stringify({ deviceId, timestamp, metrics, alertType });
    const eventHash = createHash(eventData);

    // Create device event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        timestamp: new Date(timestamp),
        metrics: JSON.stringify(metrics),
        alertType: alertType || null,
        rawPayload: JSON.stringify(rawPayload || {}),
        eventHash,
      },
    });

    // Create BSV anchor entry (pending status)
    await prisma.bsvAnchor.create({
      data: {
        eventId: event.id,
        dataHash: eventHash,
        status: 'pending',
        network: process.env.BSV_NETWORK || 'testnet',
      },
    });

    // Emit realtime event to connected clients
    try {
      const socketClient = io();
      socketClient.emit('device-event', {
        deviceId: device.deviceId,
        ownerId: device.ownerId,
        event: {
          id: event.id,
          deviceId: device.deviceId,
          timestamp: event.timestamp,
          metrics: JSON.parse(event.metrics),
          alertType: event.alertType,
        },
      });
    } catch (socketError) {
      console.warn('Socket.IO not available, skipping realtime emit:', socketError);
    }

    res.status(201).json({
      message: 'Event ingested successfully',
      event: {
        id: event.id,
        deviceId: device.deviceId,
        timestamp: event.timestamp,
        eventHash,
      },
    });
  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
