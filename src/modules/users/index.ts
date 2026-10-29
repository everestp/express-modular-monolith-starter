import { Router } from 'express';

import { authenticate } from '../../core/middleware/authenticate.js';
import { userStore } from '../auth/index.js';

export function createUsersModule(config: { secret: string; issuer: string; audience: string }) {
  const router = Router();

  router.get('/me', authenticate(config.secret, config.issuer, config.audience), (req, res) => {
    const user = Array.from(userStore.values()).find((entry) => entry.id === req.auth?.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: { id: user.id, email: user.email } });
  });

  return router;
}
