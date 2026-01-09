require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const iotRoutes = require('./routes/iot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/iot', iotRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Premium Plumbing & Leak Detection API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      iot: '/api/iot'
    }
  });
});

// WebSocket for real-time IoT data
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('subscribe-device', (deviceId) => {
    socket.join(`device-${deviceId}`);
    console.log(`Client subscribed to device: ${deviceId}`);
  });

  socket.on('iot-data', (data) => {
    // Broadcast real-time IoT data to subscribers
    io.to(`device-${data.deviceId}`).emit('device-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for real-time IoT data`);
});

module.exports = { app, io };
