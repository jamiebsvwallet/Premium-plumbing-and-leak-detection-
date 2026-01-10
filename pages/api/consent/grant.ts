import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId, grantedTo, scope } = req.body;

    // Verify user owns the device
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        ownerId: req.user!.userId,
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found or access denied' });
    }

    const consent = await prisma.consentGrant.upsert({
      where: {
        userId_deviceId_grantedTo: {
          userId: req.user!.userId,
          deviceId,
          grantedTo,
        },
      },
      update: {
        active: true,
        scope: scope || 'read',
        revokedAt: null,
      },
      create: {
        userId: req.user!.userId,
        deviceId,
        grantedTo,
        scope: scope || 'read',
        active: true,
      },
    });

    res.json(consent);
  } catch (error) {
    console.error('Error granting consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
