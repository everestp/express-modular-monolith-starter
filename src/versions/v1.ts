import { Router } from 'express';

import { createAuthModule } from '../modules/auth/index.js';
import { createNotesModule } from '../modules/notes/index.js';
import { createUsersModule } from '../modules/users/index.js';

export function createV1Router(
  deps: {
    logger?: { info?: (...args: unknown[]) => void; error?: (...args: unknown[]) => void };
    config?: {
      jwtSecret?: string;
      jwtIssuer?: string;
      jwtAudience?: string;
      accessTokenTtlMs?: number;
    };
  } = {},
) {
  const router = Router();
  const secret = deps.config?.jwtSecret ?? 'development-secret-change-me-please';
  const issuer = deps.config?.jwtIssuer ?? 'express-modular-monolith-starter';
  const audience = deps.config?.jwtAudience ?? 'starter-users';
  const ttlMs = deps.config?.accessTokenTtlMs ?? 900_000;

  router.get('/health', (_req, res) => {
    res.json({ ok: true, api: 'v1' });
  });

  router.use('/auth', createAuthModule({ secret, issuer, audience, ttlMs }));
  router.use('/users', createUsersModule({ secret, issuer, audience }));
  router.use('/notes', createNotesModule({ secret, issuer, audience }));

  return router;
}
