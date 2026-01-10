import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: {
        ownerId: payload.userId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({ devices })
  } catch (error) {
    console.error('Devices list error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
