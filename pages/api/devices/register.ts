import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { name, type, metadata } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Device name is required' });
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        name,
        type: type || null,
        ownerId: decoded.userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    res.status(201).json({
      success: true,
      device: {
        id: device.id,
        name: device.name,
        type: device.type,
        ownerId: device.ownerId,
        createdAt: device.createdAt,
      },
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
