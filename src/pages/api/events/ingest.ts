import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateHash, createBSVTransaction } from '@/lib/bsv';
import { emitDeviceEvent } from '@/lib/socket';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Note: In production, you might want device-specific authentication
    // For MVP, we accept events with a valid device ID
    const { deviceId, timestamp, metrics, alertType, rawPayload } = req.body;

    if (!deviceId || !timestamp || !metrics) {
      return res.status(400).json({ 
        error: 'deviceId, timestamp, and metrics are required' 
      });
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        owner: true,
        consents: {
          where: { granted: true, revokedAt: null },
          include: { operator: true },
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Generate hash of event data
    const eventData = JSON.stringify({ deviceId, timestamp, metrics, alertType });
    const dataHash = generateHash(eventData);

    // Create BSV transaction (async, won't block response)
    let bsvTxId = null;
    let bsvRawTx = null;
    let bsvStatus = 'pending';

    try {
      const bsvTx = await createBSVTransaction(dataHash);
      bsvTxId = bsvTx.txid;
      bsvRawTx = bsvTx.rawTx;
      bsvStatus = bsvTx.status;
    } catch (error) {
      console.error('[BSV] Transaction creation failed:', error);
      // Continue without BSV - it's optional for MVP
    }

    // Store event in database
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId: device.id,
        timestamp: new Date(timestamp),
        metrics: JSON.stringify(metrics),
        alertType: alertType || null,
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
        dataHash,
        bsvTxId,
        bsvRawTx,
        bsvStatus,
      },
    });

    // Emit real-time event to connected clients
    emitDeviceEvent(device.id, {
      id: event.id,
      deviceId: device.deviceId,
      timestamp: event.timestamp,
      metrics: JSON.parse(event.metrics),
      alertType: event.alertType,
      dataHash: event.dataHash,
      bsvTxId: event.bsvTxId,
    });

    res.status(201).json({
      success: true,
      event: {
        id: event.id,
        deviceId: device.deviceId,
        timestamp: event.timestamp,
        dataHash: event.dataHash,
        bsvTxId: event.bsvTxId,
        bsvStatus: event.bsvStatus,
      },
    });
  } catch (error) {
    console.error('Event ingestion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
