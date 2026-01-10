import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: Role
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function extractTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const authCookie = cookies.find(c => c.startsWith('auth='))
  
  if (!authCookie) return null
  
  return authCookie.split('=')[1]
}
