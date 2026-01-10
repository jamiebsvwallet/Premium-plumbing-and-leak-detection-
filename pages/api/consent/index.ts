import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      userId: string;
    };

    if (req.method === 'GET') {
      // Get all consents for user's devices
      const consents = await prisma.consent.findMany({
        where: {
          device: {
            ownerId: decoded.userId,
          },
        },
        include: {
          device: true,
          operator: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return res.json(consents);
    }

    if (req.method === 'POST') {
      const { deviceId, operatorId, granted } = req.body;

      if (!deviceId || !operatorId) {
        return res.status(400).json({ error: 'Device ID and operator ID are required' });
      }

      // Verify user owns the device
      const device = await prisma.device.findFirst({
        where: {
          id: deviceId,
          ownerId: decoded.userId,
        },
      });

      if (!device) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Create or update consent
      const consent = await prisma.consent.upsert({
        where: {
          deviceId_operatorId: {
            deviceId,
            operatorId,
          },
        },
        update: {
          granted: granted !== undefined ? granted : true,
        },
        create: {
          deviceId,
          operatorId,
          granted: granted !== undefined ? granted : true,
        },
      });

      return res.json(consent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Consent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
