import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all operators (users with role 'operator')
    const operators = await prisma.user.findMany({
      where: { role: 'operator' },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return res.status(200).json({ operators });
  } catch (error: any) {
    console.error('Get operators error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
