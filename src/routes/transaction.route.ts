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
  getAllTransactions,
  getAllCompletedTransactions,
  getAllPendingTransactions,
  getSingleUserTransactionForAdmin,
} from '../controllers/transaction.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
import { permission } from '../middlewares/authorization';

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

// ADMIN ROUTES
router.get('/all', permission(['admin', 'super_admin']), getAllTransactions);
router.get(
  '/admin/transaction/:transaction_id',
  permission(['admin', 'super_admin']),
  getSingleUserTransactionForAdmin
);

// THESE ROUTES ARE NOT YET WORKING
router.get(
  '/all-completed',
  permission(['admin', 'super_admin']),
  getAllCompletedTransactions
);
router.get(
  '/all-pending',
  permission(['admin', 'super_admin']),
  getAllPendingTransactions
);

export default router;
