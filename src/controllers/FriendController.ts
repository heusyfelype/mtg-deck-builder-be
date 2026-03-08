import { Request, Response } from 'express';
import { FriendService } from '../services/FriendService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';

export class FriendController {
    static removeFriend = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
        const userId = req.user?.id;
        const { friendId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        if (!friendId) {
            return res.status(400).json({
                success: false,
                message: 'ID do amigo é obrigatório'
            });
        }

        await FriendService.removeFriendship(userId, friendId);

        const response: ApiResponse = {
            success: true,
            message: 'Amizade desfeita com sucesso'
        };

        return res.json(response);
    });

    static getFriends = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId é obrigatório'
            });
        }

        const friends = await FriendService.getFriends(userId);

        const response: ApiResponse = {
            success: true,
            message: 'Lista de amigos recuperada com sucesso',
            data: friends
        };

        return res.json(response);
    });
}
