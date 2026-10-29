import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number((error as { statusCode?: number }).statusCode ?? 500)
      : 500;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: string }).code ?? 'internal_error')
      : 'internal_error';
  const message = error instanceof Error ? error.message : 'Internal server error';

  res.status(statusCode).json({
    type: 'https://example.com/problems/' + code,
    title: code.replace(/_/g, ' '),
    status: statusCode,
    detail: message,
    instance: req.originalUrl,
  });
};
