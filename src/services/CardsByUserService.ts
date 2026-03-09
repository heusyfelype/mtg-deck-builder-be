import { CardsByUserRepository } from '../repositories/CardsByUserRepository';
import { CardRepository } from '../repositories/CardRepository';
import { SaveCardsByUserDTO, CardsByUserItem } from '../types/cardsByUser';
import { AppError } from '../types';

export class CardsByUserService {
    private cardsByUserRepository: CardsByUserRepository;
    private cardRepository: CardRepository;

    constructor() {
        this.cardsByUserRepository = new CardsByUserRepository();
        this.cardRepository = new CardRepository();
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
        const cards = await this.cardRepository.findCardsByIds(uniqueCardIds);
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

    async getUserCards(queryParams: any, userId: string, page: number = 1, limit: number = 20) {

        if (limit > 100) {
            limit = 100;
        }

        const filter: Record<string, any> = this.buildFilterQuery(queryParams, userId);

        const { cards, total } = await this.cardsByUserRepository.findPaginatedByUserId(page, limit, filter);

        const totalPages = Math.ceil(total / limit);

        return {
            cards,
            pagination: {
                totalItems: total,
                currentPage: page,
                pageSize: limit,
                totalPages
            }
        };
    }

    private buildFilterQuery(query: any, userId: string): Record<string, any> {
        const filter: Record<string, any> = {};

        if (query.lang) {
            filter.card.lang = query.lang;
        }

        if (!userId) {
            throw new AppError('UserId is required', 400);
        }

        filter.userId = userId;

        const textFields = ['printed_name', 'type_line', 'oracle_text', 'mana_cost'];

        textFields.forEach(field => {
            if (query[field]) {
                if (!filter.$and) filter.$and = [];

                const safeRegexString = this.removeDiacriticsRegex(query[field]);

                filter.$and.push({
                    $or: [
                        { [`card.${field}`]: { $regex: safeRegexString, $options: 'i' } },
                        { [`card.card_faces.${field}`]: { $regex: safeRegexString, $options: 'i' } }
                    ]
                });
            }
        });

        // 3. Regex match specifically for set_name
        if (query.set_name) {
            if (!filter.card) filter.card = {};
            const safeSetRegexString = this.removeDiacriticsRegex(query.set_name);
            filter.card.set_name = { $regex: safeSetRegexString, $options: 'i' };
        }

        // 4. Exact Numeric Match (CMC)
        if (query.cmc) {
            if (!filter.card) filter.card = {};
            const cmcValue = Number(query.cmc);
            if (!isNaN(cmcValue)) {
                filter.card.cmc = cmcValue;
            }
        }

        // 5. Array explicitly includes (Color Identity "R,U" -> requires both R and U)
        if (query.color_identity) {
            if (!filter.card) filter.card = {};
            // Assuming it comes comma-separated like "R,U"
            const colors = String(query.color_identity).split(',').map(c => c.trim().toUpperCase());
            if (colors.includes('C')) {
                filter.card.color_identity = { $size: 0 };
            } else if (colors.length > 0) {
                filter.card.color_identity = { $all: colors };
            }
        }

        // 6. Dot notation object matches (e.g., legalities[standard]=legal)
        if (query.legalities && typeof query.legalities === 'object') {
            if (!filter.card) filter.card = {};
            Object.keys(query.legalities).forEach(format => {
                filter.card[`legalities.${format}`] = query.legalities[format];
            });
        }

        return filter;
    }

    private removeDiacriticsRegex(str: string): string {
        return str
            .replace(/[aáàãâä]/gi, '[aáàãâä]')
            .replace(/[eéèêë]/gi, '[eéèêë]')
            .replace(/[iíìîï]/gi, '[iíìîï]')
            .replace(/[oóòõôö]/gi, '[oóòõôö]')
            .replace(/[uúùûü]/gi, '[uúùûü]')
            .replace(/[cç]/gi, '[cç]');
    }
}
