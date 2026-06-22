import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([field, e]) => [field, (e as mongoose.Error.ValidatorError).message])
      )
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  if ((err as any)?.code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({ message: `Duplicate ${field}` });
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({ message: 'Server error', error: message });
};

export default errorHandler;
