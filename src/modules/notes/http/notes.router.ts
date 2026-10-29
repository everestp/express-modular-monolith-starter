import { Router } from 'express';

import { authenticate } from '../../../core/middleware/authenticate.js';
import { validate } from '../../../core/middleware/validate.js';
import type { NotesService } from '../application/notes.service.js';
import { createNotesController } from './notes.controller.js';
import { createNoteRequestSchema, updateNoteRequestSchema } from './notes.schemas.js';

export function createNotesRouter(
  service: NotesService,
  config: { secret: string; issuer: string; audience: string },
) {
  const router = Router();
  const controller = createNotesController(service);

  router.use(authenticate(config.secret, config.issuer, config.audience));
  router.get('/', controller.list);
  router.post('/', validate(createNoteRequestSchema), controller.create);
  router.get('/:id', controller.getById);
  router.patch('/:id', validate(updateNoteRequestSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
