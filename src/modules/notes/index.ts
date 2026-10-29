import type { NotesRepository } from './domain/notes.ports.js';
import { NotesService } from './application/notes.service.js';
import { InMemoryNotesRepository } from './infrastructure/notes.repository.js';
import { createNotesRouter } from './http/notes.router.js';

export type NotesModuleConfig = {
  secret: string;
  issuer: string;
  audience: string;
};

export function createNotesModule(
  config: NotesModuleConfig,
  repository: NotesRepository = new InMemoryNotesRepository(),
) {
  const service = new NotesService(repository);
  return createNotesRouter(service, config);
}

export type { Note } from './domain/note.js';
export { InMemoryNotesRepository } from './infrastructure/notes.repository.js';
