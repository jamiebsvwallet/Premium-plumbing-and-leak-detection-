import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Job report ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const jobReport = await prisma.jobReport.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          device: {
            select: {
              id: true,
              deviceId: true,
              name: true,
              location: true,
            },
          },
          bsvTransactions: true,
        },
      });

      if (!jobReport) {
        return res.status(404).json({ error: 'Job report not found' });
      }

      // Check authorization
      const isCustomer = jobReport.customerId === req.user!.userId;
      const isCreator = jobReport.createdBy === req.user!.userId;

      if (!isCustomer && !isCreator) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(200).json({ jobReport });
    } catch (error: any) {
      console.error('Get job report error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
