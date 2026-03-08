import { FriendRepository } from '../repositories/FriendRepository';

export class FriendService {
    static async removeFriendship(userId: string, friendId: string): Promise<void> {
        await Promise.all([
            FriendRepository.removeFriend(userId, friendId),
            FriendRepository.removeFriend(friendId, userId)
        ]);
    }

    static async getFriends(userId: string): Promise<any[]> {
        return await FriendRepository.getFriendsByUserId(userId);
    }
}
