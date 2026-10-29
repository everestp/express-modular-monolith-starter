import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './core/middleware/error-handler.js';
import { notFoundHandler } from './core/middleware/not-found.js';
import { createLogger } from './core/logger/logger.js';
import { createV1Router } from './versions/v1.js';

export type AppDependencies = {
  logger?: {
    info: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    child?: (bindings: Record<string, unknown>) => {
      info: (...args: unknown[]) => void;
      error: (...args: unknown[]) => void;
      warn: (...args: unknown[]) => void;
    };
  };
  config?: {
    nodeEnv?: string;
    port?: number;
    host?: string;
    jwtSecret?: string;
    jwtIssuer?: string;
    jwtAudience?: string;
    accessTokenTtlMs?: number;
    refreshTokenTtlMs?: number;
    trustProxy?: boolean;
  };
  db?: {
    query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  };
};

export function createApp(deps: AppDependencies = {}) {
  const app = express();
  const logger = deps.logger ?? createLogger();

  app.set('trust proxy', deps.config?.trustProxy ?? false);
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, status: 'healthy' });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      if (deps.db) {
        await deps.db.query('SELECT 1 as ok');
      }
      res.json({ ok: true, status: 'ready' });
    } catch (error) {
      logger.error({ error }, 'Database readiness check failed');
      res.status(503).json({ ok: false, status: 'not-ready' });
    }
  });

  app.get('/version', (_req, res) => {
    res.json({
      name: 'express-modular-monolith-starter',
      version: '0.1.0',
      nodeEnv: deps.config?.nodeEnv ?? 'development',
    });
  });

  app.use(
    '/api/v1',
    createV1Router({
      logger,
      config: {
        jwtSecret: deps.config?.jwtSecret ?? 'development-secret-change-me-please',
        jwtIssuer: deps.config?.jwtIssuer ?? 'express-modular-monolith-starter',
        jwtAudience: deps.config?.jwtAudience ?? 'starter-users',
        accessTokenTtlMs: deps.config?.accessTokenTtlMs ?? 900_000,
      },
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
