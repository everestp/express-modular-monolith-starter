import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

export function validate<T extends ZodTypeAny>(
  schema: T,
  target: 'body' | 'query' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[target]);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: parsed.error.flatten(),
      });
    }

    req[target] = parsed.data as never;
    return next();
  };
}
