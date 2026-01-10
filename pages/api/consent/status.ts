import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all consents for the current user (as customer)
    const consents = await prisma.consent.findMany({
      where: { customerId: req.user!.userId },
      include: {
        operator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ consents });
  } catch (error: any) {
    console.error('Get consent status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
