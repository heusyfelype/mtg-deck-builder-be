import { CardsByUserRepository } from '../repositories/CardsByUserRepository';
import { SaveCardsByUserDTO, CardsByUserItem } from '../types/cardsByUser';
import { AppError } from '../types';

export class CardsByUserService {
    private cardsByUserRepository: CardsByUserRepository;

    constructor() {
        this.cardsByUserRepository = new CardsByUserRepository();
    }

    async saveUserCards(items: SaveCardsByUserDTO[]): Promise<void> {
        if (!items || items.length === 0) {
            throw new AppError('Request body must be a non-empty array', 400);
        }

        // 1. Flatten the grouped structure to get all unique cardIds
        const uniqueCardIds = [
            ...new Set(items.flatMap((item) => item.cards.map((c) => c.cardId)))
        ];

        // 2. Fetch full card objects from allCards by their `id` field
        const cards = await this.cardsByUserRepository.findCardsByIds(uniqueCardIds);
        const cardMap = new Map(cards?.map((c) => [c.id, c]));

        // 3. Build the full items list — one CardsByUserItem per (userId + card)
        const fullItems: CardsByUserItem[] = [];
        const notFoundIds: string[] = [];

        for (const dto of items) {
            for (const cardDto of dto.cards) {
                const card = cardMap.get(cardDto.cardId);
                if (!card) {
                    notFoundIds.push(cardDto.cardId);
                    continue;
                }
                fullItems.push({
                    userId: dto.userId,
                    quantity: Number(cardDto.quantity),
                    card
                });
            }
        }

        if (notFoundIds.length > 0) {
            console.warn(`[CardsByUserService] Cards not found in allCards: ${notFoundIds.join(', ')}`);
        }

        if (fullItems.length === 0) {
            throw new AppError('None of the provided cardIds were found in the database', 404);
        }

        // 4. Upsert — one record per (userId + card.id)
        await this.cardsByUserRepository.upsertMany(fullItems);
    }

    async getUserCards(userId: string): Promise<CardsByUserItem[]> {
        return this.cardsByUserRepository.findByUserId(userId);
    }
}
