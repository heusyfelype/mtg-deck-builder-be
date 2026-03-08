import { Request, Response } from 'express';
import { userService } from '../services/UserService';
import { CreateUserDTO, UpdateUserDTO, ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';

class UserController {
  createUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const userData: CreateUserDTO = req.body;

    const user = await userService.createUser(userData);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário criado com sucesso',
      data: user
    };

    return res.status(201).json(response);
  });

  getUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuário não encontrado'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Usuário encontrado',
      data: user
    };

    return res.json(response);
  });

  getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {
    const users = await userService.getAllUsers();

    const response: ApiResponse = {
      success: true,
      message: 'Usuários recuperados com sucesso',
      data: users
    };

    return res.json(response);
  });

  updateUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userData: UpdateUserDTO = req.body;

    // Verificar se o usuário está tentando atualizar seus próprios dados
    // ou se é um admin (implementar lógica de permissões conforme necessário)
    if (req.user?.id !== id) {
      const response: ApiResponse = {
        success: false,
        message: 'Não autorizado a atualizar este usuário'
      };
      return res.status(403).json(response);
    }

    const updatedUser = await userService.updateUser(id, userData);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    };

    return res.json(response);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    // Verificar se o usuário está tentando deletar seus próprios dados
    if (req.user?.id !== id) {
      const response: ApiResponse = {
        success: false,
        message: 'Não autorizado a deletar este usuário'
      };
      return res.status(403).json(response);
    }

    await userService.deleteUser(id);

    const response: ApiResponse = {
      success: true,
      message: 'Usuário deletado com sucesso'
    };

    return res.json(response);
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const user = await userService.getUserById(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Perfil recuperado com sucesso',
      data: user
    };

    return res.json(response);
  });

  searchUsers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const filter = req.query.filter as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.searchUsers(filter, page, limit);

    const response: ApiResponse = {
      success: true,
      message: 'Usuários recuperados com sucesso',
      data: result
    };

    return res.json(response);
  });
}

export const userController = new UserController();