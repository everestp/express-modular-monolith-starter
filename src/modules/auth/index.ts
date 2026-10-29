import { createAccessToken } from '../../core/security/access-token.js';
import type { AuthUserRepository } from './domain/auth.ports.js';
import { AuthService } from './application/auth.service.js';
import { InMemoryAuthRepository } from './infrastructure/auth.repository.js';
import { createAuthRouter } from './http/auth.router.js';

export type AuthModuleConfig = {
  secret: string;
  issuer: string;
  audience: string;
  ttlMs: number;
};

export function createAuthModule(
  config: AuthModuleConfig,
  repository: AuthUserRepository = new InMemoryAuthRepository(),
) {
  const service = new AuthService(
    repository,
    {
      sign: async ({ userId, email }) =>
        createAccessToken({
          userId,
          email,
          secret: config.secret,
          issuer: config.issuer,
          audience: config.audience,
          ttlMs: config.ttlMs,
        }),
    },
    config,
  );

  return createAuthRouter(service, config);
}

export type { AuthUser } from './domain/auth-user.js';
export { InMemoryAuthRepository } from './infrastructure/auth.repository.js';
