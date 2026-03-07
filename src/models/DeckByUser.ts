import mongoose, { Schema } from 'mongoose';
import { DeckByUser } from '../types/deckByUser';

const deckByUserSchema = new Schema<DeckByUser>(
    {
        userId: { type: String, required: true },
        deckName: { type: String, required: true },
        cards: [
            {
                _id: false,
                quantity: { type: Number, required: true },
                card: { type: Schema.Types.Mixed, required: true }
            }
        ],
        sideboard: [
            {
                _id: false,
                quantity: { type: Number, required: true },
                card: { type: Schema.Types.Mixed, required: true }
            }
        ]
    },
    {
        strict: false,
        timestamps: true,
        collection: 'deckByUser'
    }
);

// Optional: you might want an index on userId and deckName
deckByUserSchema.index({ userId: 1, deckName: 1 });

export default mongoose.model<DeckByUser>('deckByUser', deckByUserSchema);
