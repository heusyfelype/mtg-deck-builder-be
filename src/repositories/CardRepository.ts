
import CardModel from '../models/Card';
import { Card } from '../types/card';

export class CardRepository {
    async findPaginated(skip: number, limit: number, filter: Record<string, any> = {}): Promise<{ cards: Card[], total: number }> {
        // Use aggregation to sort by color_identity (alphabetically by concatenated colors),
        // then by number of colors (ascending), then by cmc (ascending), and apply pagination.
        // Expect `colorKey` and `colorCount` to be stored on documents to allow index-backed sort.

        if(!filter['search-for-land']){
        }

            // Expect `colorKey` and `colorCount` to be stored on documents to allow index-backed sort.
            // If the caller did not explicitly filter by `type_line` (i.e. by lands),
            // add a default filter to exclude lands from results.
            const filterStr = JSON.stringify(filter || {});
            const hasTypeLineFilter = filterStr.includes('"type_line"');
            const matchFilter: Record<string, any> = { ...(filter || {}) };

            if (!hasTypeLineFilter) {
                matchFilter.type_line = { $not: /land/i };
            }

            const results = await CardModel.aggregate([
                { $match: matchFilter },
            {
                $sort: {

                    cmc: 1,
                    colorCount: 1,
                    colorKey: 1,
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
