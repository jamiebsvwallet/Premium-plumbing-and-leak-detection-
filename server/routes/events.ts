import express, { Request, Response } from 'express';
import { PrismaClient, AnchorStatus } from '@prisma/client';
import { computeSha256 } from '../utils/bsv';
import { Server } from 'socket.io';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/events/ingest
 * IoT webhook endpoint to receive device events
 * 
 * Expected payload:
 * {
 *   deviceId: string,
 *   eventType: string,
 *   data: object
 * }
 */
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const { deviceId, eventType, data } = req.body;

    if (!deviceId || !eventType || !data) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, eventType, data' });
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { owner: true, consents: { where: { granted: true }, include: { operator: true } } },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Serialize data and compute SHA-256
    const dataString = JSON.stringify(data);
    const sha256Hash = computeSha256(dataString);

    // Create device event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId,
        eventType,
        data: dataString,
        sha256: sha256Hash,
        anchorStatus: AnchorStatus.PENDING,
      },
    });

    console.log(`Event ingested: ${event.id} for device ${deviceId}`);

    // Get Socket.IO instance from app
    const io: Server = req.app.get('io');

    // Emit to device owner's room
    io.to(`user:${device.ownerId}`).emit('device-event', {
      eventId: event.id,
      deviceId: event.deviceId,
      eventType: event.eventType,
      data: JSON.parse(event.data),
      sha256: event.sha256,
      timestamp: event.timestamp,
    });

    // Emit to operator rooms if consent is granted
    for (const consent of device.consents) {
      io.to(`operator:${consent.operatorId}`).emit('device-event', {
        eventId: event.id,
        deviceId: event.deviceId,
        eventType: event.eventType,
        data: JSON.parse(event.data),
        sha256: event.sha256,
        timestamp: event.timestamp,
      });
    }

    // Emit to device-specific room
    io.to(`device:${deviceId}`).emit('device-event', {
      eventId: event.id,
      deviceId: event.deviceId,
      eventType: event.eventType,
      data: JSON.parse(event.data),
      sha256: event.sha256,
      timestamp: event.timestamp,
    });

    res.json({ success: true, eventId: event.id, sha256: sha256Hash });
  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
