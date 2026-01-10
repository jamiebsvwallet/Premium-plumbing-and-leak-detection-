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

    // Verify operator exists and has operator role
    const operator = await prisma.user.findUnique({
      where: { id: operatorId },
    });

    if (!operator || operator.role !== 'operator') {
      return res.status(400).json({ error: 'Invalid operator' });
    }

    // Check if consent already exists
    const existingConsent = await prisma.consent.findUnique({
      where: {
        customerId_operatorId: {
          customerId: req.user!.userId,
          operatorId,
        },
      },
    });

    if (existingConsent) {
      // Update existing consent
      const consent = await prisma.consent.update({
        where: { id: existingConsent.id },
        data: {
          granted: true,
          grantedAt: new Date(),
          revokedAt: null,
        },
      });
      return res.status(200).json({ consent });
    }

    // Create new consent
    const consent = await prisma.consent.create({
      data: {
        customerId: req.user!.userId,
        operatorId,
        granted: true,
      },
    });

    return res.status(201).json({ consent });
  } catch (error: any) {
    console.error('Grant consent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
