import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Verify device ownership
    const device = await prisma.device.findFirst({
      where: { id: deviceId, ownerId: decoded.userId },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found or access denied' });
    }

    if (req.method === 'POST') {
      // Grant or update consent
      const { operatorId, granted } = req.body;

      if (!operatorId || granted === undefined) {
        return res.status(400).json({ error: 'operatorId and granted are required' });
      }

      const consent = await prisma.consent.upsert({
        where: {
          deviceId_operatorId: {
            deviceId,
            operatorId,
          },
        },
        update: { granted },
        create: {
          deviceId,
          ownerId: decoded.userId,
          operatorId,
          granted,
        },
      });

      return res.status(200).json({ success: true, consent });
    } else if (req.method === 'GET') {
      // Get all consents for device
      const consents = await prisma.consent.findMany({
        where: { deviceId },
        include: {
          operator: { select: { id: true, email: true, name: true } },
        },
      });

      return res.status(200).json({ success: true, consents });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Consent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
