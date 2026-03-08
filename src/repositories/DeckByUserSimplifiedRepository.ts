import DeckByUserSimplifiedModel from '../models/DeckByUserSimplified';
import { DeckByUserSimplified } from '../types/deckByUserSimplified';

export class DeckByUserSimplifiedRepository {
    static async saveSimplifiedDeck(simplifiedData: DeckByUserSimplified): Promise<any> {
        const query = { deck_by_user_id: simplifiedData.deck_by_user_id };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        return await DeckByUserSimplifiedModel.findOneAndUpdate(query, simplifiedData, options).lean();
    }

    static async getSimplifiedDecksByUserId(userId: string): Promise<DeckByUserSimplified[]> {
        return await DeckByUserSimplifiedModel.find({ user_id: userId }).lean();
    }

    static async deleteSimplifiedDecks(deckIds: string[]): Promise<any> {
        return await DeckByUserSimplifiedModel.deleteMany({ deck_by_user_id: { $in: deckIds } });
    }
}
