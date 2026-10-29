import { Router } from 'express';

import { InMemoryAuthRepository, createAuthModule } from '../modules/auth/index.js';
import { InMemoryNotesRepository, createNotesModule } from '../modules/notes/index.js';
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

  const authRepository = new InMemoryAuthRepository();
  const notesRepository = new InMemoryNotesRepository();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, api: 'v1' });
  });

  router.use('/auth', createAuthModule({ secret, issuer, audience, ttlMs }, authRepository));
  router.use('/users', createUsersModule({ secret, issuer, audience }, authRepository));
  router.use('/notes', createNotesModule({ secret, issuer, audience }, notesRepository));

  return router;
}
