import { Router } from 'express';
import { createPromotion, getPromotions, deletePromotion, validatePromotion } from '../controllers/promotion.controller';
import { authenticate, authorizeEO } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, authorizeEO, createPromotion);
router.get('/', authenticate, authorizeEO, getPromotions);
router.delete('/:id', authenticate, authorizeEO, deletePromotion);
router.post('/validate', authenticate, validatePromotion);

export default router;
