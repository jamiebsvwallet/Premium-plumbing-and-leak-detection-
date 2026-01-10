import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireRole(req, 'operator');

    if (req.method === 'GET') {
      // List all operators
      const operators = await prisma.user.findMany({
        where: { role: 'operator' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      return res.status(200).json({ operators });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('List operators error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
