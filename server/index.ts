import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook endpoint to ingest device events
app.post('/api/events/ingest', async (req, res) => {
  try {
    const { deviceId, eventType, payload } = req.body;

    if (!deviceId || !eventType || !payload) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Calculate SHA256 hash
    const payloadString = JSON.stringify(payload);
    const sha256 = crypto.createHash('sha256').update(payloadString).digest('hex');

    // Create device event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId,
        eventType,
        payload: payloadString,
        sha256,
      },
    });

    // Emit real-time event via Socket.IO
    io.to(`device:${deviceId}`).emit('deviceEvent', {
      id: event.id,
      deviceId,
      eventType,
      payload: JSON.parse(event.payload),
      sha256: event.sha256,
      anchorStatus: event.anchorStatus,
      createdAt: event.createdAt,
    });

    res.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error ingesting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', async (deviceId: string) => {
    socket.join(`device:${deviceId}`);
    console.log(`Socket ${socket.id} subscribed to device:${deviceId}`);
  });

  socket.on('unsubscribe', (deviceId: string) => {
    socket.leave(`device:${deviceId}`);
    console.log(`Socket ${socket.id} unsubscribed from device:${deviceId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.SERVER_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start anchor worker
import('./workers/anchors').then((module) => {
  module.startAnchorWorker();
});
