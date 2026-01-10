import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Subscribe to device updates
  socket.on('subscribe-device', (deviceId: string) => {
    console.log('Client subscribed to device:', deviceId);
    socket.join(`device:${deviceId}`);
  });

  // Unsubscribe from device updates
  socket.on('unsubscribe-device', (deviceId: string) => {
    console.log('Client unsubscribed from device:', deviceId);
    socket.leave(`device:${deviceId}`);
  });

  // Subscribe to user updates
  socket.on('subscribe-user', (userId: string) => {
    console.log('Client subscribed to user:', userId);
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in API routes
export { io };

// Broadcast device event to subscribers
export function broadcastDeviceEvent(deviceId: string, ownerId: string, event: any) {
  io.to(`device:${deviceId}`).emit('device-event', event);
  io.to(`user:${ownerId}`).emit('device-event', event);
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
