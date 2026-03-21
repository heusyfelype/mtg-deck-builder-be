import CardsByUserModel from '../models/CardsByUser';
import { CardsByUserItem } from '../types/cardsByUser';

export class CardsByUserRepository {
    async findCardsByIds(cardIds: string[]): Promise<CardsByUserItem[]> {
        const cards = await CardsByUserModel.find({ 'card.id': { $in: cardIds } }).lean();
        return cards;
    }

    async upsertMany(items: CardsByUserItem[]): Promise<void> {
        // Ensure embedded card has derived fields for indexing
        const bulkOps = items.map((item) => {
            const card = { ...item.card } as any;

            if (!Array.isArray(card.color_identity)) {
                card.color_identity = [];
            }

            if (!card.colorCount) {
                card.colorCount = Array.isArray(card.color_identity) ? card.color_identity.length : 0;
            }

            if (!card.colorKey) {
                card.colorKey = '';
                const sorted = [...card.color_identity].sort();
                if (sorted.length > 0)
                    card.colorKey = sorted.join('');
            }

            return {
                updateOne: {
                    filter: { userId: item.userId, 'card.id': item.card.id },
                    update: { $set: { quantity: item.quantity, card } },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await CardsByUserModel.bulkWrite(bulkOps);
        }
    }

    async findByUserId(userId: string): Promise<CardsByUserItem[]> {
        const docs = await CardsByUserModel.find({ userId }).lean();
        return docs as unknown as CardsByUserItem[];
    }

    async findPaginatedByUserId(
        page: number,
        limit: number,
        filter: Record<string, any> = {}
    ): Promise<{ cards: CardsByUserItem[], total: number }> {
        const skip = (page - 1) * limit;

        const matchFilter: Record<string, any> = { ...(filter || {}) };

        if (!filter["card"]?.["type_line"]) {
            matchFilter["card.type_line"] = { $not: /land/i };
        }

        const total = await CardsByUserModel.countDocuments(matchFilter);

        const cards = await CardsByUserModel.find(matchFilter).sort({
            'card.cmc': 1,
            'card.colorCount': 1,
            'card.colorKey': 1,
        }).limit(limit).skip(skip);

        return { cards: cards as unknown as CardsByUserItem[], total };
    }
}
