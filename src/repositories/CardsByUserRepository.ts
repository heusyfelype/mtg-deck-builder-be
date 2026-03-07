import CardsByUserModel from '../models/CardsByUser';
import CardModel from '../models/Card';
import { CardsByUserItem } from '../types/cardsByUser';
import { Card } from '../types/card';

export class CardsByUserRepository {

    async findCardsByIds(cardIds: string[]): Promise<Card[]> {
        const cards = await CardModel.find({ id: { $in: cardIds } }).lean();
        return cards as unknown as Card[];
    }

    async upsertMany(items: CardsByUserItem[]): Promise<void> {
        const bulkOps = items.map((item) => ({
            updateOne: {
                filter: { userId: item.userId, 'card.id': item.card.id },
                update: { $set: { quantity: item.quantity, card: item.card } },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await CardsByUserModel.bulkWrite(bulkOps);
        }
    }

    async findByUserId(userId: string): Promise<CardsByUserItem[]> {
        const docs = await CardsByUserModel.find({ userId }).lean();
        return docs as unknown as CardsByUserItem[];
    }
}
