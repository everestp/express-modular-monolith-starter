import type { NextFunction, Request, Response } from 'express';

import type { NotesService } from '../application/notes.service.js';

export function createNotesController(service: NotesService) {
  return {
    list: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const notes = await service.listByOwner(String(req.auth?.userId ?? ''));
        return res.json({ notes });
      } catch (error) {
        return next(error);
      }
    },
    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const note = await service.createNote(String(req.auth?.userId ?? ''), req.body);
        return res.status(201).json({ note });
      } catch (error) {
        return next(error);
      }
    },
    getById: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const note = await service.getNote(String(req.auth?.userId ?? ''), String(req.params.id));
        return res.json({ note });
      } catch (error) {
        return next(error);
      }
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const note = await service.updateNote(
          String(req.auth?.userId ?? ''),
          String(req.params.id),
          req.body,
        );
        return res.json({ note });
      } catch (error) {
        return next(error);
      }
    },
    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await service.deleteNote(String(req.auth?.userId ?? ''), String(req.params.id));
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    },
  };
}
