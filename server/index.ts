import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/:\d+$/, ':3000') || 'http://localhost:3000',
    credentials: true,
  },
})

const prisma = new PrismaClient()
const PORT = process.env.SERVER_PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// IoT Event Ingestion Webhook
app.post('/api/events/ingest', async (req, res) => {
  try {
    const { deviceId, timestamp, metrics, alertType, rawPayload } = req.body

    if (!deviceId || !timestamp || !metrics) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        owner: true,
      },
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    // Create SHA-256 hash of event data
    const eventData = JSON.stringify({ deviceId, timestamp, metrics, alertType, rawPayload })
    const sha256 = crypto.createHash('sha256').update(eventData).digest('hex')

    // Persist event
    const event = await prisma.deviceEvent.create({
      data: {
        deviceId,
        timestamp: new Date(timestamp),
        metrics: JSON.stringify(metrics),
        alertType: alertType || null,
        rawPayload: JSON.stringify(rawPayload || {}),
        sha256,
        anchorStatus: 'PENDING',
      },
    })

    // Emit to device owner's room
    io.to(`user:${device.ownerId}`).emit('device:event', {
      deviceId: event.deviceId,
      eventId: event.id,
      timestamp: event.timestamp,
      metrics: JSON.parse(event.metrics),
      alertType: event.alertType,
      anchorStatus: event.anchorStatus,
    })

    // Check for operator consents and emit to their rooms
    const consents = await prisma.consent.findMany({
      where: {
        ownerId: device.ownerId,
        deviceId: deviceId,
        granted: true,
      },
      include: {
        operator: true,
      },
    })

    for (const consent of consents) {
      io.to(`operator:${consent.operatorId}`).emit('device:event', {
        deviceId: event.deviceId,
        eventId: event.id,
        timestamp: event.timestamp,
        metrics: JSON.parse(event.metrics),
        alertType: event.alertType,
        anchorStatus: event.anchorStatus,
      })
    }

    return res.status(201).json({ 
      event: {
        id: event.id,
        sha256: event.sha256,
        anchorStatus: event.anchorStatus,
      }
    })
  } catch (error) {
    console.error('Event ingestion error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Authenticate and join rooms
  socket.on('authenticate', async (token: string) => {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any

      if (payload && payload.userId) {
        // Join user room
        socket.join(`user:${payload.userId}`)
        
        // If operator, also join operator room
        if (payload.role === 'OPERATOR' || payload.role === 'ADMIN') {
          socket.join(`operator:${payload.userId}`)
        }

        socket.emit('authenticated', { userId: payload.userId, role: payload.role })
        console.log(`User ${payload.userId} (${payload.role}) authenticated and joined rooms`)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      socket.emit('auth:error', { error: 'Invalid token' })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO server ready for connections`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...')
  await prisma.$disconnect()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
