import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { createHash } from '@/lib/bsv';

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
      // Get job reports based on user role
      const where = user.role === 'operator' 
        ? {} // Operators can see all reports
        : { userId: user.userId }; // Customers see only their reports

      const reports = await prisma.jobReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          device: {
            select: {
              id: true,
              deviceId: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching job reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    if (user.role !== 'operator') {
      return res.status(403).json({ error: 'Operator access required' });
    }

    try {
      const { userEmail, deviceId, title, description, reportData } = req.body;

      if (!userEmail || !title || !description) {
        return res.status(400).json({ 
          error: 'userEmail, title, and description are required' 
        });
      }

      // Find the customer user
      const customer = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Find device if provided
      let device = null;
      if (deviceId) {
        device = await prisma.device.findUnique({
          where: { deviceId },
        });

        if (!device || device.ownerId !== customer.id) {
          return res.status(400).json({ 
            error: 'Device not found or does not belong to customer' 
          });
        }
      }

      // Create report hash for potential BSV anchoring
      const reportContent = JSON.stringify({ title, description, reportData });
      const reportHash = createHash(reportContent);

      // Create job report
      const report = await prisma.jobReport.create({
        data: {
          userId: customer.id,
          deviceId: device?.id || null,
          title,
          description,
          reportData: reportData ? JSON.stringify(reportData) : null,
          reportHash,
          createdById: user.userId,
        },
      });

      res.status(201).json({
        message: 'Job report created successfully',
        report,
      });
    } catch (error) {
      console.error('Error creating job report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
