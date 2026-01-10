import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      // Get all consents for the user
      const consents = await prisma.consent.findMany({
        where: { customerId: user.userId },
        include: {
          operator: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.status(200).json({ consents });
    } catch (error) {
      console.error('Error fetching consents:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { operatorEmail, granted, scope } = req.body;

      if (!operatorEmail) {
        return res.status(400).json({ error: 'operatorEmail is required' });
      }

      // Find operator
      const operator = await prisma.user.findUnique({
        where: { email: operatorEmail },
      });

      if (!operator) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      if (operator.role !== 'operator') {
        return res.status(400).json({ error: 'User is not an operator' });
      }

      // Create or update consent
      const consent = await prisma.consent.upsert({
        where: {
          customerId_operatorId: {
            customerId: user.userId,
            operatorId: operator.id,
          },
        },
        update: {
          granted: granted !== undefined ? granted : true,
          scope: scope || 'device_events',
        },
        create: {
          customerId: user.userId,
          operatorId: operator.id,
          granted: granted !== undefined ? granted : true,
          scope: scope || 'device_events',
        },
      });

      res.status(200).json({
        message: 'Consent updated successfully',
        consent,
      });
    } catch (error) {
      console.error('Error managing consent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { operatorId } = req.body;

      if (!operatorId) {
        return res.status(400).json({ error: 'operatorId is required' });
      }

      // Delete consent
      await prisma.consent.delete({
        where: {
          customerId_operatorId: {
            customerId: user.userId,
            operatorId,
          },
        },
      });

      res.status(200).json({ message: 'Consent revoked successfully' });
    } catch (error) {
      console.error('Error revoking consent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
