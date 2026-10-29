import { z } from 'zod';

export const createNoteRequestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

export const updateNoteRequestSchema = createNoteRequestSchema.partial();

export type CreateNoteRequest = z.infer<typeof createNoteRequestSchema>;
export type UpdateNoteRequest = z.infer<typeof updateNoteRequestSchema>;
