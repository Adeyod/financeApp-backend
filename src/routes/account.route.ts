import express from 'express';
import {
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
  createNewAccount,
  getSingleUserAccountByAccountNumber,
  getReceiverAccountDetails,
  getReceivingFundFlowAccountUserDetails,
  getAllAccounts,
  getSingleAccountOfAUserForAdmin,
} from '../controllers/account.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
import { permission } from '../middlewares/authorization';

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

// ADMIN ENABLED ROUTES
router.get('/all', permission(['admin', 'super_admin']), getAllAccounts);
router.get(
  '/admin/account/:user_id/:account_id',
  permission(['admin', 'super_admin']),
  getSingleAccountOfAUserForAdmin
);

export default router;
