import * as bsv from 'bsv';
import * as crypto from 'crypto';

export function computeHash(data: any): string {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

export interface BSVTransactionResult {
  txid?: string;
  rawTx?: string;
  status: 'pending' | 'created' | 'broadcast' | 'error';
  error?: string;
}

/**
 * Create an OP_RETURN transaction with the given data hash
 * NOTE: This is stubbed until BSV_PRIVATE_KEY is provided
 * Set BSV_PRIVATE_KEY in .env to enable actual transaction creation
 */
export async function createOpReturnTransaction(
  dataHash: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<BSVTransactionResult> {
  const privateKeyWif = process.env.BSV_PRIVATE_KEY;
  
  if (!privateKeyWif) {
    console.log('BSV_PRIVATE_KEY not configured - stubbing transaction');
    return {
      status: 'pending',
      error: 'BSV_PRIVATE_KEY not configured. Set it in .env to enable broadcasting.',
    };
  }

  try {
    // Initialize network
    const networkObj = network === 'mainnet' ? bsv.Networks.mainnet : bsv.Networks.testnet;
    
    // Create private key from WIF
    const privateKey = bsv.PrivateKey.fromWIF(privateKeyWif);
    const address = privateKey.toAddress(networkObj);
    
    // Create OP_RETURN script with data hash
    const script = bsv.Script.buildSafeDataOut([Buffer.from(dataHash, 'hex')]);
    
    // Create transaction
    const tx = new bsv.Transaction();
    
    // NOTE: In production, you would need to:
    // 1. Fetch UTXOs for the address
    // 2. Add inputs with tx.from(utxos)
    // 3. Add the OP_RETURN output
    // 4. Add change output
    // 5. Sign and broadcast
    
    // For now, we create a mock transaction structure
    tx.addOutput(new bsv.Transaction.Output({
      script: script,
      satoshis: 0
    }));
    
    // This is a stub - we don't actually broadcast without UTXOs
    const rawTx = tx.toString();
    
    console.log('Created BSV transaction (not broadcast - needs UTXO configuration)');
    console.log('Data hash:', dataHash);
    console.log('Address:', address.toString());
    
    return {
      rawTx: rawTx,
      status: 'created',
      error: 'Transaction created but not broadcast. Configure UTXO fetching to enable broadcasting.',
    };
  } catch (error: any) {
    console.error('Error creating BSV transaction:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Broadcast a BSV transaction
 * NOTE: This requires a BSV node connection or API service
 */
export async function broadcastTransaction(rawTx: string): Promise<{ txid?: string; error?: string }> {
  // This is a stub - in production you would use:
  // - A BSV node RPC connection
  // - A service like WhatsOnChain API
  // - Merchant API endpoints
  
  console.log('Broadcasting BSV transaction (stubbed)');
  console.log('To enable broadcasting, implement connection to BSV node or API service');
  
  return {
    error: 'Broadcasting not implemented. Configure BSV node or API service.',
  };
}
