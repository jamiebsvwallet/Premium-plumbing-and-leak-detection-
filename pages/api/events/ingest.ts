import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hashEvent } from '@/lib/hash';

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
      return res.status(400).json({ error: 'deviceId, timestamp, and metrics are required' });
    }

    // Find device by deviceId
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Compute event hash
    const eventData = {
      deviceId,
      timestamp,
      metrics,
      alertType,
    };
    const eventHash = hashEvent(eventData);

    // Store event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        timestamp: new Date(timestamp),
        metrics: JSON.stringify(metrics),
        alertType: alertType || null,
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : JSON.stringify(eventData),
        eventHash,
      },
    });

    // Create pending blockchain anchor
    await prisma.blockchainAnchor.create({
      data: {
        eventId: event.id,
        status: 'pending',
      },
    });

    // Notify via Socket.IO (if server is running)
    // This will be handled by the socket server
    try {
      // Import dynamically to avoid issues during build
      const { getSocketServer } = await import('@/lib/socket-client');
      const io = getSocketServer();
      if (io) {
        io.to(`device:${device.deviceId}`).emit('device-event', {
          deviceId: device.deviceId,
          event: {
            id: event.id,
            timestamp: event.timestamp,
            metrics: JSON.parse(event.metrics),
            alertType: event.alertType,
            eventHash: event.eventHash,
          },
        });
      }
    } catch (socketError) {
      console.log('Socket.IO not available:', socketError);
    }

    res.status(201).json({
      success: true,
      eventId: event.id,
      eventHash,
      anchorStatus: 'pending',
    });
  } catch (error) {
    console.error('Event ingestion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
