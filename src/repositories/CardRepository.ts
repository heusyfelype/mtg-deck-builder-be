
import CardModel from '../models/Card';
import { Card } from '../types/card';

export class CardRepository {
    async findCardsByIds(cardIds: string[]): Promise<Card[]> {
        const cards = await CardModel.find({ id: { $in: cardIds } }).lean();
        return cards as unknown as Card[];
    }

    async findPaginated(skip: number, limit: number, filter: Record<string, any> = {}): Promise<{ cards: Card[], total: number }> {

        const matchFilter: Record<string, any> = { ...(filter || {}) };

        if (!filter["type_line"]) {
            matchFilter.type_line = { $not: /land/i };
        }

        console.log("\n \n FILTER IN CARDS: ", JSON.stringify(matchFilter))

        const results = await CardModel.aggregate([
            { $match: matchFilter },
            {
                $sort: {
                    cmc: 1,
                    colorCount: 1,
                    colorKey: 1,
                    _id: 1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ]);

        const total = results[0]?.metadata?.[0]?.total || 0;
        const cards = results[0]?.data || [];

        return { cards: cards as unknown as Card[], total };
    }
}
