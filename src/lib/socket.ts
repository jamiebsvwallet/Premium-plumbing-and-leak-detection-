import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { verifyToken } from './auth';

let io: SocketIOServer | null = null;

export function getSocketIO(server?: HTTPServer): SocketIOServer {
  if (!io && server) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('[Socket.IO] Client connected:', socket.id);

      // Handle authentication
      socket.on('authenticate', (token: string) => {
        const user = verifyToken(token);
        if (user) {
          socket.data.user = user;
          socket.join(`user_${user.userId}`);
          console.log('[Socket.IO] User authenticated:', user.email);
          socket.emit('authenticated', { success: true });
        } else {
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      });

      // Handle device subscription
      socket.on('subscribe_device', (deviceId: string) => {
        socket.join(`device_${deviceId}`);
        console.log('[Socket.IO] Subscribed to device:', deviceId);
      });

      socket.on('unsubscribe_device', (deviceId: string) => {
        socket.leave(`device_${deviceId}`);
        console.log('[Socket.IO] Unsubscribed from device:', deviceId);
      });

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Client disconnected:', socket.id);
      });
    });
  }

  if (!io) {
    throw new Error('Socket.IO not initialized');
  }

  return io;
}

export function emitDeviceEvent(deviceId: string, event: any) {
  if (io) {
    io.to(`device_${deviceId}`).emit('device_event', event);
    console.log('[Socket.IO] Emitted event to device:', deviceId);
  }
}

export function emitToUser(userId: string, eventName: string, data: any) {
  if (io) {
    io.to(`user_${userId}`).emit(eventName, data);
    console.log('[Socket.IO] Emitted to user:', userId, eventName);
  }
}
