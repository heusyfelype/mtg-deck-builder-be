import DeckByUserModel from '../models/DeckByUser';
import { DeckByUser } from '../types/deckByUser';

export class DeckByUserRepository {
    static async saveDeck(deckData: DeckByUser): Promise<DeckByUser> {
        // If _id is present, we use it to find the document, allowing renaming
        const query = deckData._id
            ? { _id: deckData._id }
            : { userId: deckData.userId, deckName: deckData.deckName };

        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        return (await DeckByUserModel.findOneAndUpdate(query, deckData, options).lean()) as unknown as DeckByUser;
    }

    static async getDecksByUserId(userId: string): Promise<DeckByUser[]> {
        return await DeckByUserModel.find({ userId }).lean();
    }

    static async getDeckById(deckId: string): Promise<DeckByUser | null> {
        return await DeckByUserModel.findById(deckId).lean();
    }

    static async getDeckByUserIdAndName(userId: string, deckName: string): Promise<DeckByUser | null> {
        return await DeckByUserModel.findOne({ userId, deckName }).lean();
    }

    static async deleteDecks(ids: string[]): Promise<any> {
        return await DeckByUserModel.deleteMany({ _id: { $in: ids } });
    }
}
