
import { CardRepository } from '../repositories/CardRepository';
import { CardsByUserRepository } from '../repositories/CardsByUserRepository';
import { AppError, Card } from '../types';

export class CardService {
    private cardRepository: CardRepository;
    private cardByUserRepository: CardsByUserRepository;

    constructor() {
        this.cardRepository = new CardRepository();
        this.cardByUserRepository = new CardsByUserRepository();
    }

    async getCards(queryParams: any) {
        // Extract pagination parameters
        const pageStr = queryParams.page as string;
        const limitStr = queryParams.limit as string;

        // Determine page and limit with defaults
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        let limit = limitStr ? parseInt(limitStr, 10) : 50;

        // Validate page
        if (isNaN(page) || page < 1) {
            throw new AppError('Page must be a positive integer', 400);
        }

        // Validate limit
        if (isNaN(limit) || limit < 1) {
            throw new AppError('Limit must be a positive integer', 400);
        }

        if (limit > 100) {
            limit = 100;
        }

        // Build filters
        const filter: Record<string, any> = this.buildFilterQuery(queryParams);

        // Calculate how many documents to skip
        const skip = (page - 1) * limit;

        // Fetch data and total count from repository using the filter
        const { cards, total } = await this.cardRepository.findPaginated(skip, limit, filter);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        await this.populateCardsWithUserQuantities(cards);

        return {
            cards,
            pagination: {
                totalItems: total,
                currentPage: page,
                pageSize: limit,
                totalPages: totalPages
            }
        };
    }

    async populateCardsWithUserQuantities(cards: Card[]) {
        const cardsMap = new Map(cards.map(c => [c.id, c]));

        const userCards = await this.cardByUserRepository.findCardsByIds(Array.from(cardsMap.keys()));

        userCards.forEach(uc => {
            const card = cardsMap.get(uc.card.id);
            if (card) {
                (card as any).quantity = uc.quantity;
            }
        });
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

    private buildFilterQuery(query: any): Record<string, any> {
        const filter: Record<string, any> = {};

        // 1. Exact matches (Strings)
        if (query.lang) {
            filter.lang = query.lang;
        }

        // 2. Regex matches for Root OR Nested inside card_faces
        const textFields = ['printed_name', 'type_line', 'mana_cost'];

        textFields.forEach(field => {
            if (query[field]) {
                if (!filter.$and) filter.$and = [];

                const safeRegexString = this.removeDiacriticsRegex(query[field]);

                if (field == 'printed_name') {
                    filter.$and.push({
                        $or: [
                            { [field]: { $regex: safeRegexString, $options: 'i' } },
                            { [`card_faces.${field}`]: { $regex: safeRegexString, $options: 'i' } },
                            { [`oracle_text`]: { $regex: safeRegexString, $options: 'i' } },
                            { [`card_faces.oracle_text`]: { $regex: safeRegexString, $options: 'i' } },
                            { [`printed_text`]: { $regex: safeRegexString, $options: 'i' } },
                            { [`card_faces.printed_text`]: { $regex: safeRegexString, $options: 'i' } }
                        ]
                    });
                    return;
                }
                filter.$and.push({
                    $or: [
                        { [field]: { $regex: safeRegexString, $options: 'i' } },
                        { [`card_faces.${field}`]: { $regex: safeRegexString, $options: 'i' } }
                    ]
                });
            }
        });

        // 3. Regex match specifically for set_name
        if (query.set_name) {
            const safeSetRegexString = this.removeDiacriticsRegex(query.set_name);
            filter.set_name = { $regex: safeSetRegexString, $options: 'i' };
        }

        // 4. Exact Numeric Match (CMC)
        if (query.cmc) {
            const cmcValue = Number(query.cmc);
            if (!isNaN(cmcValue)) {
                filter.cmc = cmcValue;
            }
        }

        // 5. Array explicitly includes (Color Identity "R,U" -> requires both R and U)
        if (query.color_identity) {
            // Assuming it comes comma-separated like "R,U"
            const colors = String(query.color_identity).split(',').map(c => c.trim().toUpperCase());
            if (colors.includes('C')) {
                filter.color_identity = { $size: 0 };
            } else if (colors.length > 0) {
                filter.color_identity = { $all: colors };
            }
        }

        // 6. Dot notation object matches (e.g., legalities[standard]=legal)
        if (query.legalities && typeof query.legalities === 'object') {
            Object.keys(query.legalities).forEach(format => {
                filter[`legalities.${format}`] = query.legalities[format];
            });
        }

        console.log("FILTER IN CARDS: ", filter)
        return filter;
    }
}
