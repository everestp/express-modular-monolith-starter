import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../security/access-token.js';

export function authenticate(secret: string, issuer: string, audience: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const token = authorization.replace(/^Bearer\s+/i, '');
      const payload = await verifyAccessToken(token, secret, issuer, audience);

      req.auth = {
        userId: payload.userId,
        email: payload.email,
      };

      return next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
