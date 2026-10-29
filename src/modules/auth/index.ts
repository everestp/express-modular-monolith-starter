import { randomUUID } from 'node:crypto';
import { Router } from 'express';

import { loginSchema, registerSchema } from '../../core/http/common-schemas.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { validate } from '../../core/middleware/validate.js';
import { createAccessToken } from '../../core/security/access-token.js';
import { passwordHasher } from '../../core/security/password-hasher.js';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export const userStore = new Map<string, AuthUser>();

export function createAuthModule(config: {
  secret: string;
  issuer: string;
  audience: string;
  ttlMs: number;
}) {
  const router = Router();

  router.post('/register', validate(registerSchema), async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const normalizedEmail = email.toLowerCase();

    if (userStore.has(normalizedEmail)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user: AuthUser = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash: await passwordHasher.hash(password),
      createdAt: new Date().toISOString(),
    };

    userStore.set(normalizedEmail, user);
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      secret: config.secret,
      issuer: config.issuer,
      audience: config.audience,
      ttlMs: config.ttlMs,
    });

    return res.status(201).json({
      user: { id: user.id, email: user.email },
      accessToken,
    });
  });

  router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const normalizedEmail = email.toLowerCase();
    const user = userStore.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await passwordHasher.verify(user.passwordHash, password);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      secret: config.secret,
      issuer: config.issuer,
      audience: config.audience,
      ttlMs: config.ttlMs,
    });

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  });

  router.get('/me', authenticate(config.secret, config.issuer, config.audience), (req, res) => {
    const user =
      userStore.get(String(req.auth?.email ?? '')) ??
      Array.from(userStore.values()).find((entry) => entry.id === req.auth?.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: { id: user.id, email: user.email } });
  });

  return router;
}
