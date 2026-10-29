import { Router } from 'express';

import { authenticate } from '../../../core/middleware/authenticate.js';
import type { UsersService } from '../application/users.service.js';
import { createUsersController } from './users.controller.js';

export function createUsersRouter(
  service: UsersService,
  config: { secret: string; issuer: string; audience: string },
) {
  const router = Router();
  const controller = createUsersController(service);

  router.get('/me', authenticate(config.secret, config.issuer, config.audience), controller.me);

  return router;
}
