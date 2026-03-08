import { Request, Response } from 'express';
import { FriendInviteService } from '../services/FriendInviteService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorMiddleware';

export class FriendInviteController {
    static sendInvite = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
        const { invite_sender_id, invite_receiver_id } = req.body;

        if (!invite_sender_id || !invite_receiver_id) {
            return res.status(400).json({
                success: false,
                message: 'sender_id e receiver_id são obrigatórios'
            });
        }

        const invite = await FriendInviteService.sendInvite(invite_sender_id, invite_receiver_id);

        const response: ApiResponse = {
            success: true,
            message: 'Convite enviado com sucesso',
            data: invite
        };

        return res.status(201).json(response);
    });

    static getPendingInvites = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
        const { userId } = req.params;

        const invites = await FriendInviteService.getPendingInvites(userId);

        const response: ApiResponse = {
            success: true,
            message: 'Convites pendentes recuperados com sucesso',
            data: invites
        };

        return res.json(response);
    });

    static respondToInvite = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
        const { inviteId, status } = req.body;

        if (!inviteId || !status) {
            return res.status(400).json({
                success: false,
                message: 'inviteId e status são obrigatórios'
            });
        }

        const invite = await FriendInviteService.respondToInvite(inviteId, status);

        const response: ApiResponse = {
            success: true,
            message: status === 2 ? 'Convite aceito com sucesso' : 'Convite recusado com sucesso',
            data: invite
        };

        return res.json(response);
    });
}
