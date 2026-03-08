export enum FriendInviteStatus {
    Awaiting = 1,
    Approved = 2,
    Rejected = 3
}

export interface FriendInvite {
    _id?: string;
    invite_sender_id: string;
    invite_receiver_id: string;
    status: FriendInviteStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
