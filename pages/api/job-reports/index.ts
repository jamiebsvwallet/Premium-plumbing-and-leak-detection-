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
      const reports = await prisma.jobReport.findMany({
        where: {
          technicianId: decoded.userId,
        },
        include: {
          device: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(reports);
    }

    if (req.method === 'POST') {
      const { deviceId, title, description, status } = req.body;

      if (!deviceId || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const report = await prisma.jobReport.create({
        data: {
          deviceId,
          technicianId: decoded.userId,
          title,
          description,
          status: status || 'DRAFT',
        },
      });

      return res.json(report);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Job report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
