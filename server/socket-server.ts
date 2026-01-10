import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
});

// Track connected clients and their subscriptions
const deviceSubscriptions = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Subscribe to device updates
  socket.on('subscribe:device', (deviceId: string) => {
    console.log(`Socket ${socket.id} subscribing to device ${deviceId}`);
    
    // Join device-specific room
    socket.join(`device:${deviceId}`);
    
    // Track subscription
    if (!deviceSubscriptions.has(deviceId)) {
      deviceSubscriptions.set(deviceId, new Set());
    }
    deviceSubscriptions.get(deviceId)!.add(socket.id);
    
    socket.emit('subscribed', { deviceId });
  });

  // Unsubscribe from device updates
  socket.on('unsubscribe:device', (deviceId: string) => {
    console.log(`Socket ${socket.id} unsubscribing from device ${deviceId}`);
    
    socket.leave(`device:${deviceId}`);
    
    const subscribers = deviceSubscriptions.get(deviceId);
    if (subscribers) {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        deviceSubscriptions.delete(deviceId);
      }
    }
    
    socket.emit('unsubscribed', { deviceId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up subscriptions
    deviceSubscriptions.forEach((subscribers, deviceId) => {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        deviceSubscriptions.delete(deviceId);
      }
    });
  });
});

// Helper function to broadcast device events (called by API routes)
export function broadcastDeviceEvent(deviceId: string, event: any) {
  io.to(`device:${deviceId}`).emit('device:event', event);
  console.log(`Broadcasted event to device:${deviceId}`);
}

// Helper function to broadcast to all clients
export function broadcastToAll(eventName: string, data: any) {
  io.emit(eventName, data);
  console.log(`Broadcasted ${eventName} to all clients`);
}

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Export for testing
export { io, httpServer };
