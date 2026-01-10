import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const devices = await prisma.device.findMany({
      where: { ownerId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ devices });
  } catch (error: any) {
    console.error('List devices error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
