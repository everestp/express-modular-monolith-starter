import { randomUUID } from 'node:crypto';

import { passwordHasher } from '../../../core/security/password-hasher.js';
import { createAccessToken } from '../../../core/security/access-token.js';
import type { PublicUser } from '../domain/auth-user.js';
import type { AuthUser } from '../domain/auth-user.js';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../domain/auth.errors.js';
import type { AuthUserRepository } from '../domain/auth.ports.js';

export type AuthTokenFactory = {
  sign: (payload: { userId: string; email: string }) => Promise<string>;
};

export type RegisterInput = {
  email: string;
  password: string;
};

export class AuthService {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly tokenFactory: AuthTokenFactory,
    private readonly config: { secret: string; issuer: string; audience: string; ttlMs: number },
  ) {}

  async register(input: RegisterInput): Promise<{ user: PublicUser; accessToken: string }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.authUserRepository.findByEmail(email);

    if (existing) {
      throw new UserAlreadyExistsError(email);
    }

    const passwordHash = await passwordHasher.hash(input.password);
    const user: AuthUser = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date(),
    };

    await this.authUserRepository.save(user);
    const accessToken = await this.tokenFactory.sign({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }

  async login(input: RegisterInput): Promise<{ user: PublicUser; accessToken: string }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.authUserRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const validPassword = await passwordHasher.verify(user.passwordHash, input.password);

    if (!validPassword) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokenFactory.sign({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.authUserRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return { id: user.id, email: user.email };
  }

  async createAccessTokenForUser(user: AuthUser): Promise<string> {
    return createAccessToken({
      userId: user.id,
      email: user.email,
      secret: this.config.secret,
      issuer: this.config.issuer,
      audience: this.config.audience,
      ttlMs: this.config.ttlMs,
    });
  }
}
