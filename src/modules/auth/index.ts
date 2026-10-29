import { Router } from 'express';

export function createAuthModule() {
  const router = Router();

  router.post('/register', (_req, res) => {
    res.status(201).json({ ok: true, message: 'registered' });
  });

  router.post('/login', (_req, res) => {
    res.json({ ok: true, accessToken: 'stub' });
  });

  return router;
}
