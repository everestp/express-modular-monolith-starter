import { createLogger } from './core/logger/logger.js';

export function createContainer() {
  const logger = createLogger();

  return {
    logger,
    auth: {
      register: async (input: { email: string; password: string }) => ({
        id: 'demo-user-id',
        email: input.email,
      }),
    },
  };
}
