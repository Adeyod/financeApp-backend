import express from 'express';
import {
  getAllUserTransactionsWithQuery,
  getUserSingleAccountTransactions,
  creditUserAccount,
  getTransactionResponseFromPaystackWebhook,
  getPaystackCallBack,
  bankTransfer,
  getBankDetailsAndCodes,
  transferToOtherBank,
  getUserSingleTransaction,
  transferToFundFlowAccount,
  getPaystacktransactionStatus,
} from '../controllers/transaction.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.post('/web-hook', getTransactionResponseFromPaystackWebhook);
router.get('/call-back', getPaystackCallBack);
router.get('/status-paystack/:reference', getPaystacktransactionStatus);

router.use(verifyAccessToken);
router.get('/user-transactions', getAllUserTransactionsWithQuery);

router.post('/send-to-other-bank', transferToOtherBank);
router.post('/send-to-fund-flow', transferToFundFlowAccount);
router.get(
  '/single-account-transactions/:account_number',
  getUserSingleAccountTransactions
);

router.get('/single-transaction/:transaction_id', getUserSingleTransaction);
router.post('/initialize', creditUserAccount);

router.post('/bank-transfer', bankTransfer);
router.get('/banks', getBankDetailsAndCodes);

export default router;
