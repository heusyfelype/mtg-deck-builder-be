import mongoose, { Schema } from 'mongoose';
import { DeckByUserSimplified } from '../types/deckByUserSimplified';

const deckByUserSimplifiedSchema = new Schema<DeckByUserSimplified>(
    {
        user_id: { type: String, required: true },
        deck_name: { type: String, required: true },
        deck_by_user_id: { type: String, required: true },
        deck_cover_image: { type: String, default: '' },
        color_identity: { type: [String], default: [] }
    },
    {
        timestamps: true,
        collection: 'deckByUserSimplified'
    }
);

deckByUserSimplifiedSchema.index({ user_id: 1 });

export default mongoose.model<DeckByUserSimplified>('deckByUserSimplified', deckByUserSimplifiedSchema);
