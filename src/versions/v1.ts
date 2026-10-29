import { Router } from 'express';

export function createV1Router(_deps: { logger?: { info: (...args: unknown[]) => void } } = {}) {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, api: 'v1' });
  });

  router.post('/auth/register', (_req, res) => {
    res.status(201).json({ ok: true, message: 'User registered' });
  });

  router.post('/auth/login', (_req, res) => {
    res.json({ ok: true, accessToken: 'demo-access-token' });
  });

  router.get('/notes', (_req, res) => {
    res.json({ ok: true, notes: [] });
  });

  return router;
}
