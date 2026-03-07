import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export const errorMiddleware = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Se for um AppError customizado
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Log do erro (em produção, usar um logger como Winston)
  console.error(`[ERROR] ${error.message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};