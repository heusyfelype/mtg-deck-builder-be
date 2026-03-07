import { Request, Response } from 'express';
import { CardsByUserService } from '../services/CardsByUserService';
import { SaveCardsByUserDTO } from '../types/cardsByUser';

const cardsByUserService = new CardsByUserService();

export const CardsByUserController = {
    /**
     * PUT /api/cards-by-user
     * Body: SaveCardsByUserDTO[]
     */
    async saveUserCards(req: Request, res: Response): Promise<void> {
        const items: SaveCardsByUserDTO[] = req.body;

        await cardsByUserService.saveUserCards(items);

        res.status(200).json({
            success: true,
            message: 'User collection saved successfully'
        });
    },

    /**
     * GET /api/cards-by-user/:userId
     */
    async getUserCards(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
        const cards = await cardsByUserService.getUserCards(userId);

        res.status(200).json({
            success: true,
            message: 'User cards retrieved successfully',
            data: { cards }
        });
    }
};
