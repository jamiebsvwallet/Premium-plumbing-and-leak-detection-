import { NextApiResponse } from 'next';
import { requireRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { createOpReturnTransaction } from '@/lib/bsv/transaction';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 10 } = req.body;

    // Get pending BSV transactions
    const pendingTransactions = await prisma.bSVTransaction.findMany({
      where: { status: 'pending' },
      take: limit,
      include: {
        event: {
          include: {
            device: true,
          },
        },
        jobReport: true,
      },
    });

    const results = [];

    for (const tx of pendingTransactions) {
      console.log(`Processing BSV anchor for transaction ${tx.id}`);
      
      // Create OP_RETURN transaction
      const result = await createOpReturnTransaction(
        tx.dataHash,
        (tx.network as 'mainnet' | 'testnet') || 'testnet'
      );

      // Update transaction record
      const updatedTx = await prisma.bSVTransaction.update({
        where: { id: tx.id },
        data: {
          status: result.status === 'created' ? 'created' : result.status === 'broadcast' ? 'broadcast' : 'pending',
          txid: result.txid,
          rawTx: result.rawTx,
        },
      });

      results.push({
        transactionId: updatedTx.id,
        eventId: tx.eventId,
        jobReportId: tx.jobReportId,
        dataHash: tx.dataHash,
        status: updatedTx.status,
        txid: updatedTx.txid,
        error: result.error,
      });
    }

    return res.status(200).json({
      processed: results.length,
      results,
      message: results.length === 0 
        ? 'No pending transactions to process' 
        : 'Transactions processed. Check individual results for status.',
    });
  } catch (error: any) {
    console.error('BSV anchor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Only operators/admins can trigger BSV anchoring
export default requireRole('operator')(handler);
