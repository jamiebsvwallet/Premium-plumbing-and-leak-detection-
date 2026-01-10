import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { createOpReturnTransaction } from '@/lib/bsv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);

  if (!user || user.role !== 'operator') {
    return res.status(403).json({ error: 'Operator access required' });
  }

  try {
    // Fetch pending BSV anchors
    const pendingAnchors = await prisma.bsvAnchor.findMany({
      where: { status: 'pending' },
      take: 10, // Process up to 10 at a time
      include: {
        event: {
          include: {
            device: true,
          },
        },
      },
    });

    if (pendingAnchors.length === 0) {
      return res.status(200).json({
        message: 'No pending anchors to process',
        processed: 0,
      });
    }

    const results = [];

    for (const anchor of pendingAnchors) {
      try {
        // Create BSV transaction
        const tx = await createOpReturnTransaction(anchor.dataHash);

        if (tx) {
          // Update anchor with transaction details
          await prisma.bsvAnchor.update({
            where: { id: anchor.id },
            data: {
              status: 'broadcasted',
              txId: tx.txId,
              rawTx: tx.rawTx,
              network: tx.network,
            },
          });

          results.push({
            anchorId: anchor.id,
            eventId: anchor.eventId,
            txId: tx.txId,
            status: 'success',
          });
        } else {
          results.push({
            anchorId: anchor.id,
            eventId: anchor.eventId,
            status: 'failed',
            error: 'Failed to create transaction',
          });
        }
      } catch (error) {
        console.error('Error processing anchor:', anchor.id, error);
        results.push({
          anchorId: anchor.id,
          eventId: anchor.eventId,
          status: 'failed',
          error: 'Processing error',
        });
      }
    }

    res.status(200).json({
      message: 'Anchors processed',
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error processing BSV anchors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
