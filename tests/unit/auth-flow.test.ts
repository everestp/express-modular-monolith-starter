import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('auth and notes flow', () => {
  it('registers a user, logs in, reads me, and creates a note', async () => {
    const app = createApp({
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
      .send({ email: 'alice@example.com', password: 'super-secret-password' });

    expect(register.status).toBe(201);
    expect(register.body.user.email).toBe('alice@example.com');

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'super-secret-password' });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();

    const me = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('alice@example.com');

    const note = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ title: 'Hello', content: 'First note' });

    expect(note.status).toBe(201);
    expect(note.body.note.title).toBe('Hello');
  });
});
