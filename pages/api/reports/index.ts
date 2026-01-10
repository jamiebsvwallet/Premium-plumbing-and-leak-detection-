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
      // Create job report (operators only)
      if (payload.role !== 'OPERATOR' && payload.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only operators can create reports' })
      }

      const { userId, deviceId, title, description } = req.body

      if (!userId || !deviceId || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Verify device exists
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      })

      if (!device) {
        return res.status(404).json({ error: 'Device not found' })
      }

      // TODO: Generate PDF report (see lib/pdf.ts for implementation stub)
      // const pdfPath = await generatePDFReport({ title, description, deviceId })
      const pdfPath = null // Placeholder - implement PDF generation

      // TODO: Optionally anchor to BSV blockchain
      // const bsvTxId = await anchorReportToBSV(reportData)
      const bsvTxId = null // Placeholder - implement BSV anchoring

      // Create report
      const report = await prisma.jobReport.create({
        data: {
          userId,
          deviceId,
          operatorId: payload.userId,
          title,
          description,
          pdfPath,
          bsvTxId,
        },
        include: {
          user: {
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

      // TODO: Send email notification to customer
      // await sendReportNotification(report)

      return res.status(201).json({ report })
    } else if (req.method === 'GET') {
      // List job reports
      let where: any = {}

      if (payload.role === 'CUSTOMER') {
        // Customers see their own reports
        where.userId = payload.userId
      } else if (payload.role === 'OPERATOR') {
        // Operators see reports they created
        where.operatorId = payload.userId
      }
      // Admins see all reports

      const reports = await prisma.jobReport.findMany({
        where,
        include: {
          user: {
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
        orderBy: {
          createdAt: 'desc',
        },
      })

      return res.status(200).json({ reports })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Job report error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
