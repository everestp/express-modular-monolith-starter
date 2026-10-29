import pino from 'pino';

export type Logger = ReturnType<typeof createLogger>;

export function createLogger(level = 'info') {
  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}
