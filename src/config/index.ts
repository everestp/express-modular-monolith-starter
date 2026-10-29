import 'dotenv/config';

import { envSchema } from './env.schema.js';

export function loadConfig(env: Record<string, string | undefined> = process.env) {
  const parsed = envSchema.parse(env);

  return {
    ...parsed,
    redacted: {
      NODE_ENV: parsed.NODE_ENV,
      HOST: parsed.HOST,
      PORT: parsed.PORT,
      LOG_LEVEL: parsed.LOG_LEVEL,
      JWT_ISSUER: parsed.JWT_ISSUER,
      JWT_AUDIENCE: parsed.JWT_AUDIENCE,
      ACCESS_TOKEN_TTL: parsed.ACCESS_TOKEN_TTL,
      REFRESH_TOKEN_TTL: parsed.REFRESH_TOKEN_TTL,
      TRUST_PROXY: parsed.TRUST_PROXY,
      DATABASE_URL: '[redacted]',
    },
  };
}
