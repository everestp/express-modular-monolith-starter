import type { Note } from './note.js';

export interface NotesRepository {
  listByOwner(ownerId: string): Promise<Note[]>;
  create(note: Note): Promise<Note>;
  getById(noteId: string): Promise<Note | null>;
  update(note: Note): Promise<Note>;
  delete(noteId: string): Promise<void>;
}
