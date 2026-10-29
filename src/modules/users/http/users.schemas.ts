import { z } from 'zod';

export const meResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});
