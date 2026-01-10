import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/events';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/:\d+$/, ':3000') || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.SERVER_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user-specific room
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined room: user:${userId}`);
  });

  // Join operator-specific room
  socket.on('join-operator-room', (operatorId: string) => {
    socket.join(`operator:${operatorId}`);
    console.log(`Socket ${socket.id} joined room: operator:${operatorId}`);
  });

  // Join device-specific room
  socket.on('join-device-room', (deviceId: string) => {
    socket.join(`device:${deviceId}`);
    console.log(`Socket ${socket.id} joined room: device:${deviceId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});
