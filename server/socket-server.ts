import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Socket.IO Server Setup
 * 
 * Handles real-time communication for device events and digital twin updates.
 * Users join rooms based on their user ID and devices they have access to.
 */
export function setupSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      (socket as any).user = payload;
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as JWTPayload;
    console.log(`[Socket.IO] User connected: ${user.email}`);

    // Join user's personal room
    socket.join(`user:${user.userId}`);

    // If operator, join operator room
    if (user.role === 'operator' || user.role === 'admin') {
      socket.join('operators');
    }

    // Join device rooms
    socket.on('join-device', async (deviceId: string) => {
      try {
        // Check if user has access to this device
        const device = await prisma.device.findFirst({
          where: {
            id: deviceId,
            OR: [
              { ownerId: user.userId },
              {
                consentGrants: {
                  some: {
                    grantedTo: user.email,
                    active: true,
                  },
                },
              },
            ],
          },
        });

        if (device) {
          socket.join(`device:${deviceId}`);
          console.log(`[Socket.IO] ${user.email} joined device:${deviceId}`);
          socket.emit('joined-device', { deviceId });
        } else {
          socket.emit('error', { message: 'Access denied to this device' });
        }
      } catch (error) {
        console.error('[Socket.IO] Error joining device room:', error);
        socket.emit('error', { message: 'Failed to join device room' });
      }
    });

    socket.on('leave-device', (deviceId: string) => {
      socket.leave(`device:${deviceId}`);
      console.log(`[Socket.IO] ${user.email} left device:${deviceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${user.email}`);
    });
  });

  return io;
}

/**
 * Emit device event to all connected clients with access
 */
export async function emitDeviceEvent(
  io: SocketIOServer,
  deviceId: string,
  event: any
) {
  io.to(`device:${deviceId}`).emit('device-event', event);
  
  // Also emit to operators
  io.to('operators').emit('device-event', event);
}
