import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'POST') {
      const { deviceId, operatorEmail } = req.body;

      if (!deviceId || !operatorEmail) {
        return res.status(400).json({ 
          error: 'deviceId and operatorEmail are required' 
        });
      }

      // Find device
      const device = await prisma.device.findUnique({
        where: { deviceId },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Check if user owns the device
      if (device.ownerId !== user.userId) {
        return res.status(403).json({ error: 'Not authorized to grant consent' });
      }

      // Find operator
      const operator = await prisma.user.findUnique({
        where: { email: operatorEmail },
      });

      if (!operator || operator.role !== 'operator') {
        return res.status(404).json({ error: 'Operator not found' });
      }

      // Create or update consent
      const consent = await prisma.consent.upsert({
        where: {
          customerId_operatorId_deviceId: {
            customerId: user.userId,
            operatorId: operator.id,
            deviceId: device.id,
          },
        },
        update: {
          granted: true,
          revokedAt: null,
        },
        create: {
          customerId: user.userId,
          operatorId: operator.id,
          deviceId: device.id,
          granted: true,
        },
      });

      return res.status(201).json({
        success: true,
        consent,
      });
    }

    if (req.method === 'GET') {
      // Get all consents for user's devices
      const consents = await prisma.consent.findMany({
        where: { customerId: user.userId },
        include: {
          device: true,
          operator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        consents,
      });
    }

    if (req.method === 'DELETE') {
      const { consentId } = req.body;

      if (!consentId) {
        return res.status(400).json({ error: 'consentId is required' });
      }

      const consent = await prisma.consent.findUnique({
        where: { id: consentId },
      });

      if (!consent || consent.customerId !== user.userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Revoke consent
      await prisma.consent.update({
        where: { id: consentId },
        data: {
          granted: false,
          revokedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Consent revoked',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Consent management error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
