import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.string().default('info'),
  JWT_SECRET: z.string().min(32).default('development-secret-change-me-please'),
  JWT_ISSUER: z.string().default('express-modular-monolith-starter'),
  JWT_AUDIENCE: z.string().default('starter-users'),
  ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900000),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(604800000),
  TRUST_PROXY: z.coerce.boolean().default(false),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/app'),
});

export type AppConfig = z.infer<typeof envSchema>;
