import { Router } from 'express'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { generateEventHash } from '../../lib/crypto'

const prisma = new PrismaClient()

export default function ingestRouter(io: Server) {
  const router = Router()

  router.post('/ingest', async (req, res) => {
    try {
      const { deviceId, timestamp, metrics, alertType, rawPayload } = req.body

      if (!deviceId || !timestamp || !metrics) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Verify device exists
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { user: true },
      })

      if (!device) {
        return res.status(404).json({ error: 'Device not found' })
      }

      // Generate SHA-256 hash
      const eventData = {
        deviceId,
        timestamp: new Date(timestamp),
        metrics,
        alertType: alertType || null,
        rawPayload: rawPayload || null,
      }
      const sha256 = generateEventHash(eventData)

      // Create device event
      const event = await prisma.deviceEvent.create({
        data: {
          deviceId,
          timestamp: new Date(timestamp),
          metrics: JSON.stringify(metrics),
          alertType: alertType || null,
          rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
          sha256,
          anchorStatus: 'PENDING',
        },
      })

      // Emit to device owner room
      io.to(`user:${device.userId}`).emit('device-event', {
        deviceId,
        event: {
          id: event.id,
          timestamp: event.timestamp,
          metrics: JSON.parse(event.metrics),
          alertType: event.alertType,
          sha256: event.sha256,
        },
      })

      // Check for consents and emit to operators
      const consents = await prisma.consent.findMany({
        where: {
          deviceId,
          granted: true,
        },
      })

      for (const consent of consents) {
        io.to(`operator:${consent.operatorId}`).emit('device-event', {
          deviceId,
          event: {
            id: event.id,
            timestamp: event.timestamp,
            metrics: JSON.parse(event.metrics),
            alertType: event.alertType,
            sha256: event.sha256,
          },
        })
      }

      return res.status(201).json({
        id: event.id,
        sha256: event.sha256,
        anchorStatus: event.anchorStatus,
      })
    } catch (error) {
      console.error('Event ingest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  })

  return router
}
