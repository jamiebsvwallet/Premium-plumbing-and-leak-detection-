import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'POST') {
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
          type: type || 'leak-sensor',
          metadata: metadata ? JSON.stringify(metadata) : null,
          ownerId: user.userId,
        },
      });

      return res.status(201).json({
        success: true,
        device: {
          ...device,
          metadata: device.metadata ? JSON.parse(device.metadata) : null,
        },
      });
    }

    if (req.method === 'GET') {
      // Get all devices for the user
      const devices = await prisma.device.findMany({
        where: { ownerId: user.userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        devices: devices.map(d => ({
          ...d,
          metadata: d.metadata ? JSON.parse(d.metadata) : null,
        })),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Device registration error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
