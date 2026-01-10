import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    const { name, type, location } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Device name is required' })
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        name,
        type: type || null,
        location: location || null,
        ownerId: payload.userId,
      },
    })

    return res.status(201).json({ device })
  } catch (error) {
    console.error('Device registration error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
