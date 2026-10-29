export class NotesError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'NotesError';
  }
}

export class NoteNotFoundError extends NotesError {
  constructor(noteId: string) {
    super(`Note ${noteId} not found`, 404, 'note_not_found');
  }
}

export class NoteForbiddenError extends NotesError {
  constructor(noteId: string) {
    super(`You are not allowed to update note ${noteId}`, 403, 'note_forbidden');
  }
}
