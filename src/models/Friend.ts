import mongoose, { Schema } from 'mongoose';
import { UserFriends } from '../types/friend';

const friendSchema = new Schema(
    {
        user_id: { type: String, required: true },
        name: { type: String, required: true }
    },
    { _id: false }
);

const userFriendsSchema = new Schema<UserFriends>(
    {
        user_id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        friends: [friendSchema]
    },
    {
        timestamps: true,
        collection: 'friends'
    }
);

export default mongoose.model<UserFriends>('friends', userFriendsSchema);
