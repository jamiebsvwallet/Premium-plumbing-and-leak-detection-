import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get all devices for the user
      const devices = await prisma.device.findMany({
        where: { ownerId: user.userId },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      return res.status(200).json({ devices });
    }

    if (req.method === 'POST') {
      // Register a new device
      const { deviceId, name, type, metadata } = req.body;

      if (!deviceId || !name) {
        return res.status(400).json({ error: 'deviceId and name are required' });
      }

      // Check if device already exists
      const existingDevice = await prisma.device.findUnique({
        where: { deviceId },
      });

      if (existingDevice) {
        return res.status(400).json({ error: 'Device ID already registered' });
      }

      const device = await prisma.device.create({
        data: {
          deviceId,
          name,
          type: type || 'leak-detector',
          metadata: metadata ? JSON.stringify(metadata) : null,
          ownerId: user.userId,
        },
      });

      return res.status(201).json({ device });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Device registration error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
