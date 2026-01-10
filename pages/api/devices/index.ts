import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const { deviceId } = req.query;

    if (deviceId) {
      // Get specific device
      const device = await prisma.device.findFirst({
        where: {
          id: deviceId as string,
          OR: [
            { ownerId: decoded.userId },
            {
              consents: {
                some: {
                  operatorId: decoded.userId,
                  granted: true,
                },
              },
            },
          ],
        },
        include: {
          owner: { select: { id: true, email: true, name: true } },
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found or access denied' });
      }

      return res.status(200).json({ success: true, device });
    }

    // Get all devices for user
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          { ownerId: decoded.userId },
          {
            consents: {
              some: {
                operatorId: decoded.userId,
                granted: true,
              },
            },
          },
        ],
      },
      include: {
        owner: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, devices });
  } catch (error) {
    console.error('Devices fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
