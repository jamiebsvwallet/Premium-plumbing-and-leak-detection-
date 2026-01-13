import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const { name, serialNo } = req.body;

    if (!name || !serialNo) {
      return res.status(400).json({ error: 'Name and serial number are required' });
    }

    // Check if device with serial number already exists
    const existingDevice = await prisma.device.findUnique({
      where: { serialNo },
    });

    if (existingDevice) {
      return res.status(400).json({ error: 'Device with this serial number already exists' });
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        name,
        serialNo,
        ownerId: decoded.userId,
      },
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
