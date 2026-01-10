import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const devices = await prisma.device.findMany({
        where: {
          ownerId: req.user!.userId,
        },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, type, serialNumber } = req.body;

      if (!name || !type || !serialNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const device = await prisma.device.create({
        data: {
          name,
          type,
          serialNumber,
          ownerId: req.user!.userId,
        },
      });

      res.json(device);
    } catch (error) {
      console.error('Error creating device:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
