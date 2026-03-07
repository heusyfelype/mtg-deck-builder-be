import { Router } from 'express';
import { CardController } from '../controllers/CardController';

const router = Router();
const cardController = new CardController();

// Route to get a paginated list of cards
router.get('/', cardController.listCards);

export default router;
