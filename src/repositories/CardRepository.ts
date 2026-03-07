
import CardModel from '../models/Card';
import { Card } from '../types/card';

export class CardRepository {
    async findPaginated(skip: number, limit: number, filter: Record<string, any> = {}): Promise<{ cards: Card[], total: number }> {
        // Fetch the total number of documents matching the filter
        const total = await CardModel.countDocuments(filter);

        // Fetch the required page of documents matching the filter
        const cards = await CardModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean();

        return { cards: cards as unknown as Card[], total };
    }
}
