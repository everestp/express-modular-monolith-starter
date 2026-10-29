import { Router } from 'express';

export function createNotesModule() {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ ok: true, notes: [] });
  });

  router.post('/', (_req, res) => {
    res.status(201).json({ ok: true, note: { id: 'note-1', title: 'Welcome' } });
  });

  return router;
}
