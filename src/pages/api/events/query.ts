import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = requireAuth(req);
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find device
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        consents: {
          where: {
            granted: true,
            revokedAt: null,
          },
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check authorization
    const isOwner = device.ownerId === user.userId;
    const hasConsent = device.consents.some(c => c.operatorId === user.userId);

    if (!isOwner && !hasConsent && user.role !== 'operator') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get events for device
    const events = await prisma.deviceEvent.findMany({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 events
    });

    return res.status(200).json({
      success: true,
      device: {
        id: device.id,
        deviceId: device.deviceId,
        name: device.name,
      },
      events: events.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        metrics: JSON.parse(e.metrics),
        alertType: e.alertType,
        dataHash: e.dataHash,
        bsvTxId: e.bsvTxId,
        bsvStatus: e.bsvStatus,
      })),
    });
  } catch (error) {
    console.error('Events query error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
