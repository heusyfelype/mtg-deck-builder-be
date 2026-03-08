import { DeckByUserRepository } from '../repositories/DeckByUserRepository';
import { DeckByUserSimplifiedRepository } from '../repositories/DeckByUserSimplifiedRepository';
import CardModel from '../models/Card';
import { SaveDeckDTO, DeckByUser, DeckCard } from '../types/deckByUser';
import { Card } from '../types/card';
import { DeckByUserSimplified } from '../types/deckByUserSimplified';

export class DeckByUserService {
    static async saveUserDeck(saveDeckDTO: SaveDeckDTO): Promise<DeckByUser> {
        const { _id, userId, deckName, cards, sideborad } = saveDeckDTO;

        // Fetch full card objects for main cards
        const deckCards = await this.resolveCards(cards);

        // Fetch full card objects for sideboard cards
        const sideboardCards = await this.resolveCards(sideborad);

        const deckData: DeckByUser = {
            _id,
            userId,
            deckName,
            cards: deckCards,
            sideboard: sideboardCards
        };

        const savedDeck = await DeckByUserRepository.saveDeck(deckData);

        // Save simplified version
        await this.saveSimplifiedDeck(savedDeck);

        return savedDeck;
    }

    private static async saveSimplifiedDeck(deck: DeckByUser): Promise<void> {
        if (!deck._id) return;

        // Calculate cover image: Highest CMC art_crop from main deck only
        let coverImage = '';
        if (deck.cards && deck.cards.length > 0) {
            const sortedCards = [...deck.cards].sort((a, b) => (b.card.cmc || 0) - (a.card.cmc || 0));
            // Find the first card that has an art_crop
            const cardWithArt = sortedCards.find(c => c.card.image_uris?.art_crop);
            if (cardWithArt) {
                coverImage = cardWithArt.card.image_uris?.art_crop || '';
            }
        }

        // Calculate color identity: Set of colors from all cards (main + sideboard)
        const allCards = [...deck.cards, ...deck.sideboard];
        const colorSet = new Set<string>();
        allCards.forEach(item => {
            if (item.card.color_identity) {
                item.card.color_identity.forEach(color => colorSet.add(color));
            }
        });

        const simplifiedData: DeckByUserSimplified = {
            user_id: deck.userId,
            deck_name: deck.deckName,
            deck_by_user_id: deck._id,
            deck_cover_image: coverImage,
            color_identity: Array.from(colorSet)
        };

        await DeckByUserSimplifiedRepository.saveSimplifiedDeck(simplifiedData);
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

    static async deleteUserDecks(ids: string[]): Promise<any> {
        const deleteMain = await DeckByUserRepository.deleteDecks(ids);
        const deleteSimplified = await DeckByUserSimplifiedRepository.deleteSimplifiedDecks(ids);
        return { deleteMain, deleteSimplified };
    }

    static async getSimplifiedDecksByUserId(userId: string): Promise<DeckByUserSimplified[]> {
        return await DeckByUserSimplifiedRepository.getSimplifiedDecksByUserId(userId);
    }
}
