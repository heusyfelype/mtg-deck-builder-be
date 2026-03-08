import { FriendInviteRepository } from '../repositories/FriendInviteRepository';
import { FriendRepository } from '../repositories/FriendRepository';
import { userRepository } from '../repositories/UserRepository';
import { FriendInvite, FriendInviteStatus } from '../types/friendInvite';
import { AppError } from '../types';

export class FriendInviteService {
    static async sendInvite(senderId: string, receiverId: string): Promise<FriendInvite> {
        if (senderId === receiverId) {
            throw new AppError('Você não pode enviar um convite para si mesmo', 400);
        }

        // Check if invite already exists
        const existing = await FriendInviteRepository.findExistingInvite(senderId, receiverId);
        if (existing) {
            throw new AppError('Um convite já foi enviado para este usuário', 409);
        }

        const inviteData: Partial<FriendInvite> = {
            invite_sender_id: senderId,
            invite_receiver_id: receiverId,
            status: FriendInviteStatus.Awaiting
        };

        return await FriendInviteRepository.createInvite(inviteData);
    }

    static async getPendingInvites(userId: string): Promise<any[]> {
        const invites = await FriendInviteRepository.getPendingInvitesByReceiverId(userId);

        // Enhance with sender name
        const enhancedInvites = await Promise.all(invites.map(async (invite: any) => {
            const sender = await userRepository.findById(invite.invite_sender_id);
            return {
                ...invite.toObject ? invite.toObject() : invite,
                sender_name: sender?.name || 'Usuário Desconhecido'
            };
        }));

        return enhancedInvites;
    }

    static async respondToInvite(inviteId: string, status: FriendInviteStatus): Promise<FriendInvite> {
        const invite = await FriendInviteRepository.findById(inviteId);
        if (!invite) {
            throw new AppError('Convite não encontrado', 404);
        }

        if (invite.status !== FriendInviteStatus.Awaiting) {
            throw new AppError('Este convite já foi respondido', 400);
        }

        if (status === FriendInviteStatus.Approved) {
            // Fetch users to get their names
            const [sender, receiver] = await Promise.all([
                userRepository.findById(invite.invite_sender_id),
                userRepository.findById(invite.invite_receiver_id)
            ]);

            if (!sender || !receiver) {
                throw new AppError('Usuário não encontrado', 404);
            }

            // Update status
            await FriendInviteRepository.updateStatus(inviteId, FriendInviteStatus.Approved);

            // Mutual friend addition
            await Promise.all([
                FriendRepository.addFriend(invite.invite_receiver_id, {
                    user_id: invite.invite_sender_id,
                    name: sender.name
                }),
                FriendRepository.addFriend(invite.invite_sender_id, {
                    user_id: invite.invite_receiver_id,
                    name: receiver.name
                })
            ]);

            return { ...invite, status: FriendInviteStatus.Approved };
        } else if (status === FriendInviteStatus.Rejected) {
            await FriendInviteRepository.updateStatus(inviteId, FriendInviteStatus.Rejected);
            return { ...invite, status: FriendInviteStatus.Rejected };
        } else {
            throw new AppError('Status inválido', 400);
        }
    }
}
