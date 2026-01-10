import { NextApiResponse } from 'next';
import { requireRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, customerId, deviceId } = req.body;

    if (!title || !description || !customerId) {
      return res.status(400).json({ error: 'title, description, and customerId are required' });
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If deviceId provided, verify it belongs to the customer
    if (deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });

      if (!device || device.ownerId !== customerId) {
        return res.status(400).json({ error: 'Invalid device for this customer' });
      }
    }

    // Create job report
    const jobReport = await prisma.jobReport.create({
      data: {
        title,
        description,
        customerId,
        deviceId: deviceId || null,
        createdBy: req.user!.userId,
        status: 'draft',
      },
    });

    return res.status(201).json({ jobReport });
  } catch (error: any) {
    console.error('Create job report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Only operators can create job reports
export default requireRole('operator')(handler);
