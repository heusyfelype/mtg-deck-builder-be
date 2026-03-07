import { Router } from 'express';
import { sanitizationController } from '../controllers/SanitizationController';

const sanitRoutes = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
sanitRoutes.post('/sanitize', sanitizationController.createSanitization);



export { sanitRoutes };