import { Router } from 'express';
import { FriendController } from '../controllers/FriendController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const friendRoutes = Router();

// DELETE /api/friends/:friendId — remove a friend
friendRoutes.delete('/:friendId', authMiddleware, asyncHandler(FriendController.removeFriend));

// GET /api/friends/:userId — get friends for a user
friendRoutes.get('/:userId', authMiddleware, asyncHandler(FriendController.getFriends));

export { friendRoutes };
