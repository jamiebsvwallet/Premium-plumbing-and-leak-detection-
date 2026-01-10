import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }

    // Get BSV transactions
    const transactions = await prisma.bSVTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.status(200).json({ transactions });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
