import { Router } from 'express';

export function createUsersModule() {
  const router = Router();

  router.get('/me', (_req, res) => {
    res.json({ ok: true, user: { id: 'user-1', email: 'demo@example.com' } });
  });

  return router;
}
