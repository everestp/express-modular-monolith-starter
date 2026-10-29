import type { NextFunction, Request, Response } from 'express';

import type { AuthService } from '../application/auth.service.js';

export function createAuthController(service: AuthService) {
  return {
    register: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await service.register(req.body);
        return res.status(201).json(result);
      } catch (error) {
        return next(error);
      }
    },
    login: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await service.login(req.body);
        return res.json(result);
      } catch (error) {
        return next(error);
      }
    },
    me: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await service.me(String(req.auth?.userId ?? ''));
        return res.json({ user: result });
      } catch (error) {
        return next(error);
      }
    },
  };
}
