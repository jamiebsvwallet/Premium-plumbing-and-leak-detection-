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
      // Only operators and admins can create job reports
      if (decoded.role !== 'OPERATOR' && decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' })
      }

      const { userId, deviceId, title, content, pdfPath, bsvTxId } = req.body

      if (!userId || !deviceId || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Create job report
      const jobReport = await prisma.jobReport.create({
        data: {
          userId,
          deviceId,
          title,
          content,
          pdfPath: pdfPath || null,
          bsvTxId: bsvTxId || null,
          createdBy: decoded.userId,
        },
      })

      return res.status(201).json(jobReport)
    } else if (req.method === 'GET') {
      // Get job reports
      const { deviceId } = req.query

      let where: any = {}

      if (decoded.role === 'CUSTOMER') {
        // Customers can only see their own job reports
        where.userId = decoded.userId
      } else if (decoded.role === 'OPERATOR') {
        // Operators can see reports they created or for devices they have consent to
        where.OR = [
          { createdBy: decoded.userId },
          {
            device: {
              consents: {
                some: {
                  operatorId: decoded.userId,
                  granted: true,
                },
              },
            },
          },
        ]
      }
      // ADMIN can see all reports (no filter)

      if (deviceId && typeof deviceId === 'string') {
        where.deviceId = deviceId
      }

      const jobReports = await prisma.jobReport.findMany({
        where,
        include: {
          device: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json(jobReports)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Job report error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
