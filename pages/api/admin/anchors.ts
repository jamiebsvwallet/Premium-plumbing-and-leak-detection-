import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOpReturnTransaction } from '@/lib/bsv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Require operator role for admin actions
    const user = requireRole(req, 'operator');

    if (req.method === 'POST') {
      // Process pending anchors
      const pendingAnchors = await prisma.blockchainAnchor.findMany({
        where: { status: 'pending' },
        include: { event: true },
        take: 10, // Process in batches
      });

      const results = [];

      for (const anchor of pendingAnchors) {
        try {
          const tx = await createOpReturnTransaction(anchor.event.eventHash);

          await prisma.blockchainAnchor.update({
            where: { id: anchor.id },
            data: {
              txId: tx.txId,
              txRaw: tx.txRaw,
              status: tx.status,
            },
          });

          results.push({
            anchorId: anchor.id,
            eventHash: anchor.event.eventHash,
            txId: tx.txId,
            status: tx.status,
          });
        } catch (error: any) {
          console.error(`Failed to anchor event ${anchor.eventId}:`, error);
          
          await prisma.blockchainAnchor.update({
            where: { id: anchor.id },
            data: {
              status: 'failed',
            },
          });

          results.push({
            anchorId: anchor.id,
            eventHash: anchor.event.eventHash,
            status: 'failed',
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        processed: results.length,
        results,
      });
    }

    if (req.method === 'GET') {
      // Get anchor status
      const { eventId } = req.query;

      if (eventId && typeof eventId === 'string') {
        const anchor = await prisma.blockchainAnchor.findUnique({
          where: { eventId },
          include: { event: true },
        });

        if (!anchor) {
          return res.status(404).json({ error: 'Anchor not found' });
        }

        return res.status(200).json({ anchor });
      }

      // List all anchors
      const anchors = await prisma.blockchainAnchor.findMany({
        include: {
          event: {
            include: {
              device: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.status(200).json({ anchors });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Anchor error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
