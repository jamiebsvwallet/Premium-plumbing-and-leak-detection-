import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateHash, createBSVTransaction } from '@/lib/bsv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = requireAuth(req);

    if (req.method === 'POST') {
      // Only operators can create job reports
      if (user.role !== 'operator') {
        return res.status(403).json({ error: 'Only operators can create job reports' });
      }

      const { customerId, deviceId, title, description, reportData } = req.body;

      if (!customerId || !title || !description) {
        return res.status(400).json({ 
          error: 'customerId, title, and description are required' 
        });
      }

      // Verify customer exists
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Generate report hash
      const reportContent = JSON.stringify({ 
        customerId, 
        deviceId, 
        title, 
        description, 
        reportData,
        createdAt: new Date().toISOString(),
      });
      const reportHash = generateHash(reportContent);

      // Optionally create BSV transaction for report
      let bsvTxId = null;
      try {
        const bsvTx = await createBSVTransaction(reportHash);
        bsvTxId = bsvTx.txid;
      } catch (error) {
        console.error('[BSV] Report transaction failed:', error);
      }

      // Create job report
      const report = await prisma.jobReport.create({
        data: {
          customerId,
          deviceId: deviceId || null,
          title,
          description,
          reportData: reportData ? JSON.stringify(reportData) : null,
          reportHash,
          bsvTxId,
          createdBy: user.userId,
        },
      });

      return res.status(201).json({
        success: true,
        report,
      });
    }

    if (req.method === 'GET') {
      // Get reports based on user role
      const where = user.role === 'operator' 
        ? {} // Operators see all reports
        : { customerId: user.userId }; // Customers see only their reports

      const reports = await prisma.jobReport.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          device: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        reports: reports.map(r => ({
          ...r,
          reportData: r.reportData ? JSON.parse(r.reportData) : null,
        })),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Job report error:', error);
    if ((error as Error).message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
