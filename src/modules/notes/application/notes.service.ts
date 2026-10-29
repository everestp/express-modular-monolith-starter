import { randomUUID } from 'node:crypto';

import { NoteForbiddenError, NoteNotFoundError } from '../domain/notes.errors.js';
import type { NotesRepository } from '../domain/notes.ports.js';
import type { Note } from '../domain/note.js';

export type CreateNoteInput = {
  title: string;
  content: string;
};

export type UpdateNoteInput = Partial<CreateNoteInput>;

export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async listByOwner(ownerId: string): Promise<Note[]> {
    return this.notesRepository.listByOwner(ownerId);
  }

  async createNote(ownerId: string, input: CreateNoteInput): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: randomUUID(),
      title: input.title.trim(),
      content: input.content.trim(),
      ownerId,
      createdAt: now,
      updatedAt: now,
    };

    return this.notesRepository.create(note);
  }

  async getNote(ownerId: string, noteId: string): Promise<Note> {
    const note = await this.notesRepository.getById(noteId);

    if (!note || note.ownerId !== ownerId) {
      throw new NoteNotFoundError(noteId);
    }

    return note;
  }

  async updateNote(ownerId: string, noteId: string, input: UpdateNoteInput): Promise<Note> {
    const existing = await this.notesRepository.getById(noteId);

    if (!existing) {
      throw new NoteNotFoundError(noteId);
    }

    if (existing.ownerId !== ownerId) {
      throw new NoteForbiddenError(noteId);
    }

    const updated = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.content !== undefined ? { content: input.content.trim() } : {}),
      updatedAt: new Date(),
    };

    return this.notesRepository.update(updated);
  }

  async deleteNote(ownerId: string, noteId: string): Promise<void> {
    const existing = await this.notesRepository.getById(noteId);

    if (!existing) {
      throw new NoteNotFoundError(noteId);
    }

    if (existing.ownerId !== ownerId) {
      throw new NoteForbiddenError(noteId);
    }

    await this.notesRepository.delete(noteId);
  }
}
