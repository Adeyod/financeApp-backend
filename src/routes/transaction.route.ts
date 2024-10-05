import express from 'express';
import {
  getAllUserTransactions,
  creditUserAccount,
  getTransactionResponseFromPaystackWebhook,
  getPaystackCallBack,
} from '../controllers/transaction.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.post('/web-hook', getTransactionResponseFromPaystackWebhook);
router.get('/call-back', getPaystackCallBack);
router.use(verifyAccessToken);
router.get('/user-transactions', getAllUserTransactions);
router.get('/user-transaction/:account_id', getAllUserTransactions);
router.post('/initialize', creditUserAccount);

export default router;
