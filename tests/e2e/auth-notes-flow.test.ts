import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('auth and notes e2e flow', () => {
  it('registers a user, logs in, reads the profile, and creates a note', async () => {
    const app = createApp({
      logger: {
        info: () => undefined,
        error: () => undefined,
        warn: () => undefined,
        child: () => ({ info: () => undefined, error: () => undefined, warn: () => undefined }),
      },
      config: {
        nodeEnv: 'test',
        jwtSecret: 'test-secret-key-test-secret-key',
        jwtIssuer: 'starter',
        jwtAudience: 'starter-users',
        accessTokenTtlMs: 60_000,
        refreshTokenTtlMs: 300_000,
      },
    });

    const register = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'carol@example.com', password: 'super-secret-password' });

    expect(register.status).toBe(201);
    expect(register.body.user.email).toBe('carol@example.com');
    expect(register.body.accessToken).toBeTypeOf('string');

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'carol@example.com', password: 'super-secret-password' });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();

    const profile = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe('carol@example.com');

    const note = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ title: 'Operational note', content: 'This is a real end-to-end note' });

    expect(note.status).toBe(201);
    expect(note.body.note.title).toBe('Operational note');

    const noteList = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(noteList.status).toBe(200);
    expect(noteList.body.notes).toHaveLength(1);
    expect(noteList.body.notes[0]?.title).toBe('Operational note');
  });
});
