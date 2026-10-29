import { createApp } from './app.js';
import { loadConfig } from './config/index.js';
import { createLogger } from './core/logger/logger.js';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);

const app = createApp({
  logger,
  config: {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    host: config.HOST,
    jwtSecret: config.JWT_SECRET,
    jwtIssuer: config.JWT_ISSUER,
    jwtAudience: config.JWT_AUDIENCE,
    accessTokenTtlMs: config.ACCESS_TOKEN_TTL,
    refreshTokenTtlMs: config.REFRESH_TOKEN_TTL,
    trustProxy: config.TRUST_PROXY,
  },
  db: {
    query: async () => ({ rows: [{ ok: true }] }),
  },
});

const server = app.listen(config.PORT, config.HOST, () => {
  logger.info({ port: config.PORT, host: config.HOST }, 'Express server listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal');
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});
