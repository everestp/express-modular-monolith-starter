import { describe, expect, it } from 'vitest';

import { NotesService } from '../../src/modules/notes/application/notes.service.js';
import {
  NoteForbiddenError,
  NoteNotFoundError,
} from '../../src/modules/notes/domain/notes.errors.js';
import { InMemoryNotesRepository } from '../../src/modules/notes/infrastructure/notes.repository.js';

describe('NotesService', () => {
  it('lists only notes owned by the current user and blocks unauthorized updates', async () => {
    const repo = new InMemoryNotesRepository();
    const service = new NotesService(repo);

    await service.createNote('user-1', { title: 'Mine', content: 'This belongs to user-1' });
    await service.createNote('user-2', { title: 'Other', content: 'This belongs to user-2' });

    const owned = await service.listByOwner('user-1');
    expect(owned).toHaveLength(1);
    expect(owned[0]?.title).toBe('Mine');

    const note = await repo.getById(owned[0]!.id);
    expect(note?.ownerId).toBe('user-1');

    await expect(
      service.updateNote('user-1', note!.id, { title: 'Updated' }),
    ).resolves.toMatchObject({
      title: 'Updated',
    });

    const other = await repo.getById((await service.listByOwner('user-2'))[0]!.id);
    await expect(
      service.updateNote('user-1', other!.id, { title: 'Hacked' }),
    ).rejects.toBeInstanceOf(NoteForbiddenError);
  });

  it('throws a not found error when the note does not exist', async () => {
    const repo = new InMemoryNotesRepository();
    const service = new NotesService(repo);

    await expect(service.getNote('user-1', 'missing-note')).rejects.toBeInstanceOf(
      NoteNotFoundError,
    );
  });
});
