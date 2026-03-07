import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { sanitizationService } from '../services/SanitizationService';

class SanitizationController {
  createSanitization = asyncHandler(async (_req: Request, res: Response): Promise<Response> => {

    const data = await sanitizationService.createSanitization();

    const response: ApiResponse = {
      success: true,
      message: 'Dados Sanitizados com sucesso',
      data: data
    };

    return res.status(201).json(response);
  });

}

export const sanitizationController = new SanitizationController();