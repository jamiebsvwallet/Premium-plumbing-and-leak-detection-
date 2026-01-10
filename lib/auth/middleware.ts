import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: TokenPayload;
}

export function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = user;
    return handler(req, res);
  };
}

export function requireRole(role: string) {
  return function (
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
  ) {
    return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (req.user?.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return handler(req, res);
    });
  };
}
