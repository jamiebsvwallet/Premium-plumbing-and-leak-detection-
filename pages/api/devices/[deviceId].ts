import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId } = req.query;

    if (typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Invalid device ID' });
    }

    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        OR: [
          { ownerId: req.user!.userId },
          {
            consentGrants: {
              some: {
                grantedTo: req.user!.email,
                active: true,
              },
            },
          },
        ],
      },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
