import { Card } from './card';

export interface DeckCard {
    quantity: number;
    card: Card;
    ownerId?: string;
}

export interface DeckByUser {
    _id?: string;
    userId: string;
    deckName: string;
    cards: DeckCard[];
    sideboard: DeckCard[];
}

export interface DeckCardDTO {
    quantity: number | string;
    cardId: string;
    ownerId?: string;
}

export interface SaveDeckDTO {
    _id?: string;
    userId: string;
    deckName: string;
    cards: DeckCardDTO[];
    sideborad: DeckCardDTO[]; // Supporting the user's typo in payload
}
