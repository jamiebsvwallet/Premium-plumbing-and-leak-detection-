import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
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

    // Check access: owner can always access, operators need consent
    let hasAccess = false;
    if (device.ownerId === user.userId) {
      hasAccess = true;
    } else if (user.role === 'operator') {
      // Check if customer has granted consent to this operator
      const consent = await prisma.consent.findUnique({
        where: {
          customerId_operatorId: {
            customerId: device.ownerId,
            operatorId: user.userId,
          },
        },
      });
      hasAccess = consent?.granted || false;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch events for this device
    const events = await prisma.deviceEvent.findMany({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 events
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
