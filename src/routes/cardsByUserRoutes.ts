import { Router } from 'express';
import { CardsByUserController } from '../controllers/CardsByUserController';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// PUT /api/cards-by-user — save (upsert) a list of user-card associations
router.put('/', asyncHandler(CardsByUserController.saveUserCards));

// GET /api/cards-by-user/:userId — retrieve all saved cards for a user
router.get('/:userId', asyncHandler(CardsByUserController.getUserCards));

export default router;
