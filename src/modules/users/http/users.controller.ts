import type { NextFunction, Request, Response } from 'express';

import type { UsersService } from '../application/users.service.js';

export function createUsersController(service: UsersService) {
  return {
    me: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await service.getProfileById(String(req.auth?.userId ?? ''));
        return res.json({ user: { id: user.id, email: user.email } });
      } catch (error) {
        return next(error);
      }
    },
  };
}
