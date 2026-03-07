import { DeckByUserRepository } from '../repositories/DeckByUserRepository';
import CardModel from '../models/Card';
import { SaveDeckDTO, DeckByUser, DeckCard } from '../types/deckByUser';
import { Card } from '../types/card';

export class DeckByUserService {
    static async saveUserDeck(saveDeckDTO: SaveDeckDTO): Promise<DeckByUser> {
        const { _id, userId, deckName, cards, sideborad } = saveDeckDTO;

        // Fetch full card objects for main cards
        const deckCards = await this.resolveCards(cards);

        // Fetch full card objects for sideboard cards
        // Note: Using 'sideborad' from DTO but mapping to 'sideboard' internally
        const sideboardCards = await this.resolveCards(sideborad);

        const deckData: DeckByUser = {
            _id,
            userId,
            deckName,
            cards: deckCards,
            sideboard: sideboardCards
        };

        return await DeckByUserRepository.saveDeck(deckData);
    }

    private static async resolveCards(cardDTOs: any[]): Promise<DeckCard[]> {
        if (!cardDTOs || cardDTOs.length === 0) return [];

        const cardIds = cardDTOs.map(c => c.cardId);
        const resolvedCards = await CardModel.find({ id: { $in: cardIds } }).lean();

        const cardMap = new Map<string, Card>();
        resolvedCards.forEach(c => cardMap.set(c.id, c));

        const result: DeckCard[] = [];
        for (const dto of cardDTOs) {
            const card = cardMap.get(dto.cardId);
            if (card) {
                result.push({
                    quantity: Number(dto.quantity),
                    card
                });
            }
        }

        return result;
    }

    static async getUserDecks(userId: string): Promise<DeckByUser[]> {
        return await DeckByUserRepository.getDecksByUserId(userId);
    }

    static async getDeckById(deckId: string) {
        return await DeckByUserRepository.getDeckById(deckId);
    }
}
