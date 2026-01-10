import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      // Get all consents for the user
      let consents;
      
      if (user.role === 'customer') {
        consents = await prisma.consent.findMany({
          where: { customerId: user.userId },
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
      } else if (user.role === 'operator') {
        consents = await prisma.consent.findMany({
          where: { operatorId: user.userId },
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });
      }

      return res.status(200).json({ consents });
    }

    if (req.method === 'POST') {
      // Create or update consent
      const { operatorId, granted } = req.body;

      if (!operatorId) {
        return res.status(400).json({ error: 'operatorId is required' });
      }

      if (user.role !== 'customer') {
        return res.status(403).json({ error: 'Only customers can grant consent' });
      }

      // Verify operator exists
      const operator = await prisma.user.findUnique({
        where: { id: operatorId },
      });

      if (!operator || operator.role !== 'operator') {
        return res.status(404).json({ error: 'Operator not found' });
      }

      // Upsert consent
      const consent = await prisma.consent.upsert({
        where: {
          customerId_operatorId: {
            customerId: user.userId,
            operatorId,
          },
        },
        update: {
          granted: granted !== false,
        },
        create: {
          customerId: user.userId,
          operatorId,
          granted: granted !== false,
        },
      });

      return res.status(200).json({ consent });
    }

    if (req.method === 'DELETE') {
      // Revoke consent
      const { operatorId } = req.body;

      if (!operatorId) {
        return res.status(400).json({ error: 'operatorId is required' });
      }

      await prisma.consent.update({
        where: {
          customerId_operatorId: {
            customerId: user.userId,
            operatorId,
          },
        },
        data: {
          granted: false,
        },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Consent error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
