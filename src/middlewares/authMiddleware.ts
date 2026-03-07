import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, AuthTokenPayload, AuthenticatedRequest } from '../types';

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acesso requerido', 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET não configurado', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;

    // Adiciona os dados do usuário na requisição
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expirado', 401));
    } else {
      next(error);
    }
  }
};