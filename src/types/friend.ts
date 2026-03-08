export interface Friend {
    user_id: string;
    name: string;
}

export interface UserFriends {
    _id?: string;
    user_id: string;
    friends: Friend[];
    createdAt?: Date;
    updatedAt?: Date;
}
