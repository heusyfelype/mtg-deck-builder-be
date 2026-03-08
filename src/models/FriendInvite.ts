import mongoose, { Schema } from 'mongoose';
import { FriendInvite, FriendInviteStatus } from '../types/friendInvite';

const friendInviteSchema = new Schema<FriendInvite>(
    {
        invite_sender_id: {
            type: String,
            required: true,
            index: true
        },
        invite_receiver_id: {
            type: String,
            required: true,
            index: true
        },
        status: {
            type: Number,
            enum: FriendInviteStatus,
            default: FriendInviteStatus.Awaiting,
            required: true
        }
    },
    {
        timestamps: true,
        collection: 'friendsInvites'
    }
);

// Ensure a user can only have one active invite to another user
friendInviteSchema.index({ invite_sender_id: 1, invite_receiver_id: 1 }, { unique: true });

export default mongoose.model<FriendInvite>('friendsInvites', friendInviteSchema);
