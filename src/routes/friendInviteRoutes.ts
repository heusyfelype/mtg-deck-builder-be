import { Router } from 'express';
import { FriendInviteController } from '../controllers/FriendInviteController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const friendInviteRoutes = Router();

// POST /api/friend-invites — send a friend invite
friendInviteRoutes.post('/', authMiddleware, asyncHandler(FriendInviteController.sendInvite));

// GET /api/friend-invites/pending/:userId — get pending invites for a user
friendInviteRoutes.get('/pending/:userId', authMiddleware, asyncHandler(FriendInviteController.getPendingInvites));

// PUT /api/friend-invites/respond — approve or reject a friend invite
friendInviteRoutes.put('/respond', authMiddleware, asyncHandler(FriendInviteController.respondToInvite));

export { friendInviteRoutes };
