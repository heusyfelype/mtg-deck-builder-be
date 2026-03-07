import mongoose, { Schema } from 'mongoose';
import { CardsByUserItem } from '../types/cardsByUser';

// Flexible schema — the full Card object is stored as-is (a complex nested structure)
const cardsByUserSchema = new Schema<CardsByUserItem>(
    {
        userId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        // The full card object embedded; uses strict:false so all card fields are accepted
        card: { type: Schema.Types.Mixed, required: true }
    },
    {
        strict: false,
        collection: 'cardsByUser'
    }
);

// Compound unique index: one document per (userId + card.id)
cardsByUserSchema.index({ userId: 1, 'card.id': 1 }, { unique: true });

export default mongoose.model<CardsByUserItem>('cardsByUser', cardsByUserSchema);
