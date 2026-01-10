import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const where: any = {};

    // Customers can only see their own reports
    // Operators can see all reports they created
    if (req.user!.role === 'customer') {
      where.customerId = req.user!.userId;
    } else if (req.user!.role === 'operator') {
      where.createdBy = req.user!.userId;
    }

    const jobReports = await prisma.jobReport.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ jobReports });
  } catch (error: any) {
    console.error('List job reports error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
