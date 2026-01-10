import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reports = await prisma.jobReport.findMany({
        where: {
          userId: req.user!.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(reports);
    } catch (error) {
      console.error('Error fetching job reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { deviceId, title, description } = req.body;

      const report = await prisma.jobReport.create({
        data: {
          userId: req.user!.userId,
          deviceId,
          title,
          description,
          status: 'open',
        },
      });

      res.json(report);
    } catch (error) {
      console.error('Error creating job report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
