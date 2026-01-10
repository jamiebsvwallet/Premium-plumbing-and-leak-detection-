import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate user
    const token = extractTokenFromCookie(req.headers.cookie)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const payload = verifyToken(token)

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (req.method === 'POST') {
      // Grant consent
      const { operatorId, deviceId } = req.body

      if (!operatorId) {
        return res.status(400).json({ error: 'Operator ID is required' })
      }

      // Verify operator exists and has OPERATOR role
      const operator = await prisma.user.findUnique({
        where: { id: operatorId },
      })

      if (!operator || operator.role !== 'OPERATOR') {
        return res.status(400).json({ error: 'Invalid operator' })
      }

      // If deviceId is provided, verify ownership
      if (deviceId) {
        const device = await prisma.device.findFirst({
          where: {
            id: deviceId,
            ownerId: payload.userId,
          },
        })

        if (!device) {
          return res.status(403).json({ error: 'Device not found or access denied' })
        }
      }

      // Create or update consent
      const consent = await prisma.consent.upsert({
        where: {
          ownerId_operatorId_deviceId: {
            ownerId: payload.userId,
            operatorId,
            deviceId: deviceId || null,
          },
        },
        update: {
          granted: true,
        },
        create: {
          ownerId: payload.userId,
          operatorId,
          deviceId: deviceId || null,
          granted: true,
        },
      })

      return res.status(201).json({ consent })
    } else if (req.method === 'DELETE') {
      // Revoke consent
      const { operatorId, deviceId } = req.body

      if (!operatorId) {
        return res.status(400).json({ error: 'Operator ID is required' })
      }

      // Update consent to granted: false
      const consent = await prisma.consent.updateMany({
        where: {
          ownerId: payload.userId,
          operatorId,
          deviceId: deviceId || null,
        },
        data: {
          granted: false,
        },
      })

      return res.status(200).json({ consent })
    } else if (req.method === 'GET') {
      // List consents
      const consents = await prisma.consent.findMany({
        where: {
          ownerId: payload.userId,
          granted: true,
        },
        include: {
          operator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          device: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return res.status(200).json({ consents })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Consent error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
