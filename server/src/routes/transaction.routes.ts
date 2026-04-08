import { Router } from 'express';
import { createTransaction, getAttendeeTransactions, getEoTransactions, getTransactionById, uploadPaymentProof, confirmTransaction, rejectTransaction } from '../controllers/transaction.controller';
import { authenticate, authorizeEO } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/', authenticate, createTransaction);
router.get('/', authenticate, getAttendeeTransactions);
router.get('/eo', authenticate, authorizeEO, getEoTransactions);
router.get('/:id', authenticate, getTransactionById);
router.post('/:id/payment-proof', authenticate, upload.single('proof'), uploadPaymentProof);
router.patch('/:id/confirm', authenticate, authorizeEO, confirmTransaction);
router.patch('/:id/reject', authenticate, authorizeEO, rejectTransaction);

export default router;
