import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find device
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: { owner: true },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check authorization
    const isOwner = device.ownerId === req.user!.userId;
    let hasConsent = false;

    if (!isOwner && req.user!.role === 'operator') {
      // Check if operator has consent from device owner
      const consent = await prisma.consent.findFirst({
        where: {
          customerId: device.ownerId,
          operatorId: req.user!.userId,
          granted: true,
        },
      });
      hasConsent = !!consent;
    }

    if (!isOwner && !hasConsent) {
      return res.status(403).json({ error: 'Forbidden - no access to this device' });
    }

    // Get events for the device
    const events = await prisma.deviceEvent.findMany({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 events
    });

    const formattedEvents = events.map((event) => ({
      id: event.id,
      deviceId: device.deviceId,
      timestamp: event.timestamp,
      alertType: event.alertType,
      metrics: JSON.parse(event.metrics),
      eventHash: event.eventHash,
      createdAt: event.createdAt,
    }));

    return res.status(200).json({ events: formattedEvents });
  } catch (error: any) {
    console.error('Get events error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
