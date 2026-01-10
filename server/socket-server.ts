// Socket.IO server for realtime updates
// This can be run standalone on Render or locally
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../lib/auth';

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }

  const user = verifyToken(token);
  
  if (!user) {
    return next(new Error('Invalid token'));
  }

  socket.data.user = user;
  next();
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`User connected: ${user.email} (${user.role})`);

  // Join device rooms based on user role and permissions
  socket.on('subscribe-device', async (deviceId: string) => {
    try {
      // In a real implementation, verify access permissions here
      // For MVP, we'll allow subscription if user is authenticated
      socket.join(`device:${deviceId}`);
      console.log(`User ${user.email} subscribed to device:${deviceId}`);
      socket.emit('subscribed', { deviceId });
    } catch (error) {
      console.error('Subscribe error:', error);
      socket.emit('error', { message: 'Failed to subscribe' });
    }
  });

  socket.on('unsubscribe-device', (deviceId: string) => {
    socket.leave(`device:${deviceId}`);
    console.log(`User ${user.email} unsubscribed from device:${deviceId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${user.email}`);
  });
});

// Export for potential use in API routes (not typical, but possible)
export { io };

// Start server if this file is run directly
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`Accepting connections from: ${FRONTEND_URL}`);
  });
}
