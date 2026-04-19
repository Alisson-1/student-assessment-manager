import { NextFunction, Request, Response } from 'express';
import { AppError, ValidationError } from './errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ message: err.message, fields: err.fields });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
