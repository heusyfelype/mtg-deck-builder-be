import { Router } from 'express';
import { DeckByUserController } from '../controllers/DeckByUserController';
import { asyncHandler } from '../middlewares/errorMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// PUT /api/decks-by-user — save or update a deck
router.put('/', asyncHandler(DeckByUserController.saveUserDeck));

// GET /api/decks-by-user/single/:deckId — retrieve a single deck by its ID
router.get('/single/:deckId', asyncHandler(DeckByUserController.getDeckById));

// GET /api/decks-by-user/:userId — retrieve all decks for a user
router.get('/:userId', asyncHandler(DeckByUserController.getUserDecks));

// DELETE /api/decks-by-user — delete one or more decks by _id
router.delete('/', asyncHandler(DeckByUserController.deleteUserDecks));

export default router;
