import mongoose, { Schema } from 'mongoose';
import { Card } from '../types/card';

const allCardSchema = new Schema<Card>({}, { strict: false, collection: 'allCards' });

export default mongoose.model<Card>('allCards', allCardSchema);
