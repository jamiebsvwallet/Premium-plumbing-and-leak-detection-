import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = getUserFromRequest(req);
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find the device
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: { owner: true },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check access permissions
    let hasAccess = false;

    if (user) {
      // Owner has access
      if (device.ownerId === user.userId) {
        hasAccess = true;
      }

      // Check if operator has consent
      if (user.role === 'operator') {
        const consent = await prisma.consent.findUnique({
          where: {
            customerId_operatorId: {
              customerId: device.ownerId,
              operatorId: user.userId,
            },
          },
        });

        if (consent && consent.granted) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch events
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const events = await prisma.deviceEvent.findMany({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        anchor: true,
      },
    });

    res.status(200).json({
      device: {
        id: device.id,
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
      },
      events: events.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        metrics: JSON.parse(e.metrics),
        alertType: e.alertType,
        eventHash: e.eventHash,
        anchor: e.anchor,
      })),
    });
  } catch (error) {
    console.error('Events query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
