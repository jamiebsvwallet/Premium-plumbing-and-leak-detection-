import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../lib/auth'
import ingestRouter from './routes/ingest'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

const prisma = new PrismaClient()
const PORT = process.env.SERVER_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/events', ingestRouter(io))

// Socket.IO authentication and room management
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = verifyToken(token)
    socket.data.userId = decoded.userId
    socket.data.role = decoded.role
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', socket.data.userId)

  // Join user's personal room
  socket.join(`user:${socket.data.userId}`)

  // If operator or admin, join operator room
  if (socket.data.role === 'OPERATOR' || socket.data.role === 'ADMIN') {
    socket.join(`operator:${socket.data.userId}`)
    console.log(`User ${socket.data.userId} joined operator room`)
  }

  // Join device-specific room
  socket.on('join-device', async (deviceId: string) => {
    try {
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      })

      if (!device) {
        socket.emit('error', { message: 'Device not found' })
        return
      }

      // Check if user owns the device or is an operator with consent
      if (device.userId === socket.data.userId) {
        socket.join(`device:${deviceId}`)
        console.log(`User ${socket.data.userId} joined device room ${deviceId}`)
      } else if (socket.data.role === 'OPERATOR') {
        const consent = await prisma.consent.findFirst({
          where: {
            deviceId,
            operatorId: socket.data.userId,
            granted: true,
          },
        })

        if (consent) {
          socket.join(`device:${deviceId}`)
          console.log(`Operator ${socket.data.userId} joined device room ${deviceId}`)
        } else {
          socket.emit('error', { message: 'No consent for this device' })
        }
      } else {
        socket.emit('error', { message: 'Access denied' })
      }
    } catch (error) {
      console.error('Error joining device room:', error)
      socket.emit('error', { message: 'Internal error' })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Export io for use in routes
export { io }
