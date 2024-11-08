import express from 'express';
import {
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
  createNewAccount,
  getSingleUserAccountByAccountNumber,
  getReceiverAccountDetails,
  getReceivingFundFlowAccountUserDetails,
} from '../controllers/account.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/user-accounts', getAllUserAccountsByUserId);
router.post('/confirm-receiver-account', getReceiverAccountDetails);

router.get('/user-account/:account_id', getSingleUserAccountByUserIdAndId);
router.get(
  '/get-user-account/:account_number',
  getSingleUserAccountByAccountNumber
);
router.get(
  '/get-receiving-user-details/:account_number',
  getReceivingFundFlowAccountUserDetails
);

router.post('/user-account/create', createNewAccount);

export default router;
