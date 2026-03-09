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
                // canonicalize: sort then concat
                try {
                    const sorted = [...card.color_identity].sort();
                    card.colorKey = sorted.join('');
                } catch (e) {
                    card.colorKey = '';
                }
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
        userId: string,
        page: number,
        limit: number
    ): Promise<{ cards: CardsByUserItem[], total: number }> {
        const skip = (page - 1) * limit;
        const results = await CardsByUserModel.aggregate([
            { $match: { userId } },
            {
                $sort: {
                    'card.colorKey': 1,
                    'card.colorCount': 1,
                    'card.cmc': 1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ]);

        const total = results[0]?.metadata?.[0]?.total || 0;
        const cards = results[0]?.data || [];

        return { cards, total };
    }
}
