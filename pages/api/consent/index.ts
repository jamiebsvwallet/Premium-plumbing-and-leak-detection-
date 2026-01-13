import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (req.method === 'POST') {
      // Grant consent
      const { deviceId, operatorId } = req.body

      if (!deviceId || !operatorId) {
        return res.status(400).json({ error: 'deviceId and operatorId are required' })
      }

      // Verify user owns the device
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      })

      if (!device || device.userId !== decoded.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Verify operator exists and has OPERATOR role
      const operator = await prisma.user.findUnique({
        where: { id: operatorId },
      })

      if (!operator || operator.role !== 'OPERATOR') {
        return res.status(400).json({ error: 'Invalid operator' })
      }

      // Create or update consent
      const consent = await prisma.consent.upsert({
        where: {
          userId_deviceId_operatorId: {
            userId: decoded.userId,
            deviceId,
            operatorId,
          },
        },
        update: {
          granted: true,
        },
        create: {
          userId: decoded.userId,
          deviceId,
          operatorId,
          granted: true,
        },
      })

      return res.status(200).json(consent)
    } else if (req.method === 'DELETE') {
      // Revoke consent
      const { deviceId, operatorId } = req.query

      if (!deviceId || !operatorId || typeof deviceId !== 'string' || typeof operatorId !== 'string') {
        return res.status(400).json({ error: 'deviceId and operatorId are required' })
      }

      // Verify user owns the device
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      })

      if (!device || device.userId !== decoded.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Update consent to revoked
      await prisma.consent.updateMany({
        where: {
          userId: decoded.userId,
          deviceId,
          operatorId,
        },
        data: {
          granted: false,
        },
      })

      return res.status(200).json({ message: 'Consent revoked' })
    } else if (req.method === 'GET') {
      // List consents
      const { deviceId } = req.query

      if (!deviceId || typeof deviceId !== 'string') {
        return res.status(400).json({ error: 'deviceId is required' })
      }

      // Verify user owns the device
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      })

      if (!device || device.userId !== decoded.userId) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const consents = await prisma.consent.findMany({
        where: {
          deviceId,
          userId: decoded.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      })

      return res.status(200).json(consents)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Consent management error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
