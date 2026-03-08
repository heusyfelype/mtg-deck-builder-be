import { Request, Response } from 'express';
import { DeckByUserService } from '../services/DeckByUserService';
import { SaveDeckDTO } from '../types/deckByUser';

export class DeckByUserController {
    static async saveUserDeck(req: Request, res: Response) {
        // The body is expected to be an array or a single object based on user example
        // user example: [ { ... } ]
        const payload = req.body;

        if (Array.isArray(payload)) {
            const results = [];
            for (const deckData of payload) {
                const saved = await DeckByUserService.saveUserDeck(deckData as SaveDeckDTO);
                results.push(saved);
            }
            return res.status(200).json({
                success: true,
                message: 'Decks salvos com sucesso',
                data: results
            });
        }

        const saved = await DeckByUserService.saveUserDeck(payload as SaveDeckDTO);
        return res.status(200).json({
            success: true,
            message: 'Deck salvo com sucesso',
            data: saved
        });
    }

    static async getDeckById(req: Request, res: Response) {
        const { deckId } = req.params;
        const deck = await DeckByUserService.getDeckById(deckId);

        if (!deck) {
            return res.status(404).json({
                success: false,
                message: 'Deck não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: deck
        });
    }

    static async getUserDecks(req: Request, res: Response) {
        const { userId } = req.params;
        const decks = await DeckByUserService.getUserDecks(userId);

        return res.status(200).json({
            success: true,
            data: decks
        });
    }

    static async deleteUserDecks(req: Request, res: Response) {
        let { ids } = req.body;

        if (!ids) {
            return res.status(400).json({
                success: false,
                message: 'IDs não fornecidos'
            });
        }

        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        const result = await DeckByUserService.deleteUserDecks(ids);

        return res.status(200).json({
            success: true,
            message: 'Deck(s) deletado(s) com sucesso',
            data: result
        });
    }

    static async getSimplifiedDecks(req: Request, res: Response) {
        const { userId } = req.params;
        const decks = await DeckByUserService.getSimplifiedDecksByUserId(userId);

        return res.status(200).json({
            success: true,
            data: decks
        });
    }
}
