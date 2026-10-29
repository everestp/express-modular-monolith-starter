import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('starter app', () => {
  it('exposes health endpoints and version metadata', async () => {
    const app = createApp({
      logger: { info: () => undefined, error: () => undefined, warn: () => undefined, child: () => ({ info: () => undefined, error: () => undefined, warn: () => undefined }) },
      config: {
        nodeEnv: 'test',
        port: 3000,
        host: '127.0.0.1',
        jwtSecret: 'test-secret-test-secret',
        jwtIssuer: 'starter',
        jwtAudience: 'starter-users',
        accessTokenTtlMs: 900000,
        refreshTokenTtlMs: 604800000,
        trustProxy: false,
      },
      db: { query: async () => ({ rows: [{ now: new Date().toISOString() }] }) },
    });

    const liveness = await request(app).get('/healthz');
    expect(liveness.status).toBe(200);
    expect(liveness.body.ok).toBe(true);

    const versionResponse = await request(app).get('/version');
    expect(versionResponse.status).toBe(200);
    expect(versionResponse.body.name).toBe('express-modular-monolith-starter');
  });
});
