import FriendInviteModel from '../models/FriendInvite';
import { FriendInvite, FriendInviteStatus } from '../types/friendInvite';

export class FriendInviteRepository {
    static async createInvite(inviteData: Partial<FriendInvite>): Promise<FriendInvite> {
        return (await FriendInviteModel.create(inviteData)).toObject();
    }

    static async getPendingInvitesByReceiverId(userId: string): Promise<FriendInvite[]> {
        return await FriendInviteModel.find({
            invite_receiver_id: userId,
            status: FriendInviteStatus.Awaiting
        }).lean();
    }

    static async findExistingInvite(senderId: string, receiverId: string): Promise<FriendInvite | null> {
        return await FriendInviteModel.findOne({
            invite_sender_id: senderId,
            invite_receiver_id: receiverId
        }).lean();
    }

    static async findById(inviteId: string): Promise<FriendInvite | null> {
        return await FriendInviteModel.findById(inviteId).lean();
    }

    static async updateStatus(inviteId: string, status: FriendInviteStatus): Promise<any> {
        return await FriendInviteModel.findByIdAndUpdate(inviteId, { status }, { new: true });
    }
}
