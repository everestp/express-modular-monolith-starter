import type { Note } from '../domain/note.js';
import type { NotesRepository } from '../domain/notes.ports.js';

export class InMemoryNotesRepository implements NotesRepository {
  private readonly notes = new Map<string, Note>();

  async listByOwner(ownerId: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter((note) => note.ownerId === ownerId);
  }

  async create(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  async getById(noteId: string): Promise<Note | null> {
    return this.notes.get(noteId) ?? null;
  }

  async update(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  async delete(noteId: string): Promise<void> {
    this.notes.delete(noteId);
  }
}
