import { RequestHandler, Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const authRoutes = Router();

/**
 * @route   POST /api/auth/google
 * @desc    Login via Google OAuth2
 * @access  Public
 */
authRoutes.post('/google', authController.googleLogin);



/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token JWT
 * @access  Private
 */
authRoutes.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout
 * @access  Private
 */
authRoutes.post('/logout', authMiddleware as RequestHandler, authController.logout);

/**
 * @route   GET /api/auth/validate
 * @desc    Validar token JWT
 * @access  Private
 */
authRoutes.get('/validate', authMiddleware, authController.validateToken);

export { authRoutes };