import FriendModel from '../models/Friend';
import { Friend } from '../types/friend';

export class FriendRepository {
    static async addFriend(userId: string, friend: Friend): Promise<any> {
        return await FriendModel.findOneAndUpdate(
            { user_id: userId },
            { $addToSet: { friends: friend } },
            { upsert: true, new: true }
        ).lean();
    }

    static async removeFriend(userId: string, friendId: string): Promise<any> {
        return await FriendModel.updateOne(
            { user_id: userId },
            { $pull: { friends: { user_id: friendId } } }
        );
    }

    static async getFriendsByUserId(userId: string): Promise<Friend[]> {
        const result = await FriendModel.findOne({ user_id: userId }).lean();
        return result?.friends || [];
    }
}
