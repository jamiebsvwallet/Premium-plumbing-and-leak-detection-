import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deviceId, grantedTo } = req.body;

    const consent = await prisma.consentGrant.updateMany({
      where: {
        userId: req.user!.userId,
        deviceId,
        grantedTo,
      },
      data: {
        active: false,
        revokedAt: new Date(),
      },
    });

    res.json({ success: true, updated: consent.count });
  } catch (error) {
    console.error('Error revoking consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
