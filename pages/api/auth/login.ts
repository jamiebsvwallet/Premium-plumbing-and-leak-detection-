import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { serialize } from 'cookie'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie
    const cookie = serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    res.setHeader('Set-Cookie', cookie)

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
