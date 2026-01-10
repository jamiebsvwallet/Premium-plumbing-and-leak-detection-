import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashReport } from '@/lib/hash';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get job reports
      let reports;

      if (user.role === 'customer') {
        reports = await prisma.jobReport.findMany({
          where: { userId: user.userId },
          include: {
            device: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } else if (user.role === 'operator') {
        reports = await prisma.jobReport.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            device: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      return res.status(200).json({ reports });
    }

    if (req.method === 'POST') {
      // Create job report (operator only)
      if (user.role !== 'operator') {
        return res.status(403).json({ error: 'Only operators can create reports' });
      }

      const { title, description, userId, deviceId, status } = req.body;

      if (!title || !description || !userId) {
        return res.status(400).json({ error: 'title, description, and userId are required' });
      }

      // Verify user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compute report hash
      const reportData = { title, description, userId, deviceId, timestamp: new Date() };
      const reportHash = hashReport(reportData);

      const report = await prisma.jobReport.create({
        data: {
          title,
          description,
          userId,
          deviceId: deviceId || null,
          status: status || 'pending',
          reportHash,
        },
      });

      return res.status(201).json({ report });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Job report error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
