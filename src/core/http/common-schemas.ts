import { z } from 'zod';

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = registerSchema;

export const noteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

export const noteUpdateSchema = noteSchema.partial();

export const idParamSchema = z.object({
  id: z.string().min(1),
});
