import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      req.user = payload;
      
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
}

export function requireRole(...roles: string[]) {
  return (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
  ) => {
    return withAuth(async (req, res) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
      return handler(req, res);
    });
  };
}
