import mongoose, { Schema } from 'mongoose';
import { User } from '../types/user';

const userSchema = new Schema<User>({}, { strict: false, collection: 'users' });

export default mongoose.model<User>('users', userSchema);
