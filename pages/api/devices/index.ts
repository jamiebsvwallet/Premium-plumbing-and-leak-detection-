import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(devices)
  } catch (error) {
    console.error('Device list error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
