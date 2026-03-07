import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';

class AuthController {
  googleLogin = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { tokenId } = req.body;

    if (!tokenId) {
      const response: ApiResponse = {
        success: false,
        message: 'Token do Google (tokenId) é requerido'
      };
      return res.status(400).json(response);
    }

    const { user, token } = await authService.authenticateGoogle(tokenId);

    const response: ApiResponse = {
      success: true,
      message: 'Login com Google realizado com sucesso',
      data: {
        user,
        token,
        tokenType: 'Bearer'
      }
    };

    return res.json(response);
  });



  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        message: 'Token de acesso requerido'
      };
      return res.status(401).json(response);
    }

    const currentToken = authHeader.substring(7);
    const newToken = await authService.refreshToken(currentToken);

    const response: ApiResponse = {
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: newToken,
        tokenType: 'Bearer'
      }
    };

    return res.json(response);
  });

  logout = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
    // Em uma implementação real, você poderia:
    // 1. Adicionar o token a uma blacklist
    // 2. Invalidar o token no banco de dados
    // 3. Limpar cookies se estiver usando

    const response: ApiResponse = {
      success: true,
      message: 'Logout realizado com sucesso'
    };

    return res.json(response);
  });

  validateToken = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    // Se chegou até aqui, o token é válido (passou pelo authMiddleware)
    const response: ApiResponse = {
      success: true,
      message: 'Token válido',
      data: {
        user: req.user
      }
    };

    return res.json(response);
  });
}

export const authController = new AuthController();