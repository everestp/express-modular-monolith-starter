import { describe, expect, it } from 'vitest';

import { passwordHasher } from '../../src/core/security/password-hasher.js';
import { AuthService } from '../../src/modules/auth/application/auth.service.js';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
} from '../../src/modules/auth/domain/auth.errors.js';
import type { AuthUserRepository } from '../../src/modules/auth/domain/auth.ports.js';
import type { AuthUser } from '../../src/modules/auth/domain/auth-user.js';

class FakeAuthRepository implements AuthUserRepository {
  private readonly users = new Map<string, AuthUser>();

  async findByEmail(email: string) {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  async save(user: AuthUser) {
    this.users.set(user.email.toLowerCase(), user);
    return user;
  }
}

describe('AuthService', () => {
  it('registers a user and rejects duplicate email addresses', async () => {
    const repo = new FakeAuthRepository();
    const service = new AuthService(
      repo,
      {
        sign: async ({ userId, email }) => `token:${userId}:${email}`,
      },
      {
        secret: 'test-secret-key-test-secret-key',
        issuer: 'starter',
        audience: 'starter-users',
        ttlMs: 60_000,
      },
    );

    const registered = await service.register({
      email: 'alice@example.com',
      password: 'super-secret-123',
    });
    expect(registered.user.email).toBe('alice@example.com');
    expect(registered.accessToken).toContain('token:');

    await expect(
      service.register({ email: 'alice@example.com', password: 'another-password' }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('rejects invalid credentials', async () => {
    const repo = new FakeAuthRepository();
    const service = new AuthService(
      repo,
      {
        sign: async ({ userId, email }) => `token:${userId}:${email}`,
      },
      {
        secret: 'test-secret-key-test-secret-key',
        issuer: 'starter',
        audience: 'starter-users',
        ttlMs: 60_000,
      },
    );

    const validHash = await passwordHasher.hash('correct-password');
    await repo.save({
      id: 'user-1',
      email: 'bob@example.com',
      passwordHash: validHash,
      createdAt: new Date(),
    });

    await expect(
      service.login({ email: 'bob@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
