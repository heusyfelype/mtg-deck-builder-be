import { Request, Response } from 'express';
import { CardService } from '../services/CardService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';

export class CardController {
    private cardService: CardService;

    constructor() {
        this.cardService = new CardService();
    }

    listCards = asyncHandler(async (req: Request, res: Response) => {
        // Pass the entire query object to the service
        console.log("list cards was called: ", req.query)
        const result = await this.cardService.getCards(req.query as any);

        const response: ApiResponse = {
            success: true,
            message: 'Cards retrieved from database successfully',
            data: result
        };

        res.status(200).json(response);
    });
}
