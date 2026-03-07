import { Card } from './card';

export interface CardsByUserItem {
    userId: string;
    quantity: number;
    card: Card;
}

export interface CardsByUserCardDTO {
    quantity: number;
    cardId: string;
}

export interface SaveCardsByUserDTO {
    userId: string;
    cards: CardsByUserCardDTO[];
}
