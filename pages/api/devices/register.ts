import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    const { name, serialNumber, type } = req.body

    if (!name || !serialNumber) {
      return res.status(400).json({ error: 'Name and serialNumber are required' })
    }

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { serialNumber },
    })

    if (existingDevice) {
      return res.status(409).json({ error: 'Device already registered' })
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        name,
        serialNumber,
        type: type || null,
        userId: decoded.userId,
      },
    })

    return res.status(201).json(device)
  } catch (error) {
    console.error('Device registration error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
