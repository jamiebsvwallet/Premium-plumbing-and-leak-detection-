import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextApiRequest): JWTPayload | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(req: NextApiRequest): JWTPayload {
  const user = getUserFromRequest(req);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export function requireRole(req: NextApiRequest, role: string): JWTPayload {
  const user = requireAuth(req);
  
  if (user.role !== role) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}
