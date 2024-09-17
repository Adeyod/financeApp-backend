import express from 'express';
import { getAllUserTransactions } from '../controllers/transaction.controller';

const router = express.Router();

router.get('/user-transactions', getAllUserTransactions);
router.get('/user-transaction/:account_id', getAllUserTransactions);

export default router;
