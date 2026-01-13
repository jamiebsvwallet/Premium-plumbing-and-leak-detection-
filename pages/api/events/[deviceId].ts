import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Verify JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      userId: string;
      role: string;
    };

    // Check if user is device owner or has consent
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        consents: {
          where: {
            operatorId: decoded.userId,
          },
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const isOwner = device.ownerId === decoded.userId;
    const hasConsent = device.consents.some(c => c.granted);

    if (!isOwner && !hasConsent) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get events
    const events = await prisma.deviceEvent.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
