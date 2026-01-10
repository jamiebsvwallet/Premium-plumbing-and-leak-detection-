import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId, name, type, location, metadata } = req.body;

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
        type: type || 'leak-detector',
        location,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ownerId: req.user!.userId,
      },
    });

    return res.status(201).json({ device });
  } catch (error: any) {
    console.error('Device registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
