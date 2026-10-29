import { randomUUID } from 'node:crypto';
import { Router } from 'express';

import { noteSchema, noteUpdateSchema } from '../../core/http/common-schemas.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { validate } from '../../core/middleware/validate.js';

export type Note = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export const noteStore = new Map<string, Note>();

export function createNotesModule(config: { secret: string; issuer: string; audience: string }) {
  const router = Router();

  router.get('/', authenticate(config.secret, config.issuer, config.audience), (req, res) => {
    const notes = Array.from(noteStore.values()).filter(
      (note) => note.ownerId === req.auth?.userId,
    );
    return res.json({ notes });
  });

  router.post(
    '/',
    authenticate(config.secret, config.issuer, config.audience),
    validate(noteSchema),
    (req, res) => {
      const { title, content } = req.body as { title: string; content: string };
      const note: Note = {
        id: randomUUID(),
        title,
        content,
        ownerId: req.auth?.userId ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      noteStore.set(note.id, note);

      return res.status(201).json({ note });
    },
  );

  router.get('/:id', authenticate(config.secret, config.issuer, config.audience), (req, res) => {
    const note = noteStore.get(req.params.id as string);

    if (!note || note.ownerId !== req.auth?.userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json({ note });
  });

  router.patch(
    '/:id',
    authenticate(config.secret, config.issuer, config.audience),
    validate(noteUpdateSchema),
    (req, res) => {
      const note = noteStore.get(req.params.id as string);

      if (!note || note.ownerId !== req.auth?.userId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const updated = {
        ...note,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      noteStore.set(note.id, updated);
      return res.json({ note: updated });
    },
  );

  router.delete('/:id', authenticate(config.secret, config.issuer, config.audience), (req, res) => {
    const note = noteStore.get(req.params.id as string);

    if (!note || note.ownerId !== req.auth?.userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    noteStore.delete(note.id);
    return res.status(204).send();
  });

  return router;
}
