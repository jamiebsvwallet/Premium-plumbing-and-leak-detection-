import { NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { operatorId } = req.body;

    if (!operatorId) {
      return res.status(400).json({ error: 'operatorId is required' });
    }

    // Find and update consent
    const consent = await prisma.consent.findUnique({
      where: {
        customerId_operatorId: {
          customerId: req.user!.userId,
          operatorId,
        },
      },
    });

    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    const updatedConsent = await prisma.consent.update({
      where: { id: consent.id },
      data: {
        granted: false,
        revokedAt: new Date(),
      },
    });

    return res.status(200).json({ consent: updatedConsent });
  } catch (error: any) {
    console.error('Revoke consent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
