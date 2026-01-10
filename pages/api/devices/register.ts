import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      // Get all devices for the user
      const devices = await prisma.device.findMany({
        where: { ownerId: user.userId },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ devices });
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { deviceId, name, type, metadata } = req.body;

      if (!deviceId || !name) {
        return res.status(400).json({ error: 'deviceId and name are required' });
      }

      // Check if device already exists
      const existingDevice = await prisma.device.findUnique({
        where: { deviceId },
      });

      if (existingDevice) {
        return res.status(400).json({ error: 'Device already registered' });
      }

      // Create device
      const device = await prisma.device.create({
        data: {
          deviceId,
          name,
          type: type || 'leak_sensor',
          metadata: metadata ? JSON.stringify(metadata) : null,
          ownerId: user.userId,
        },
      });

      res.status(201).json({
        message: 'Device registered successfully',
        device,
      });
    } catch (error) {
      console.error('Error registering device:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
