import { Router } from 'express';

import { authenticate } from '../../../core/middleware/authenticate.js';
import { validate } from '../../../core/middleware/validate.js';
import type { AuthService } from '../application/auth.service.js';
import { createAuthController } from './auth.controller.js';
import { loginRequestSchema, registerRequestSchema } from './auth.schemas.js';

export function createAuthRouter(
  service: AuthService,
  config: { secret: string; issuer: string; audience: string },
) {
  const router = Router();
  const controller = createAuthController(service);

  router.post('/register', validate(registerRequestSchema), controller.register);
  router.post('/login', validate(loginRequestSchema), controller.login);
  router.get('/me', authenticate(config.secret, config.issuer, config.audience), controller.me);

  return router;
}
