import express from 'express';
import {
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
  createNewAccount,
} from '../controllers/account.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/user-accounts', getAllUserAccountsByUserId);

router.get('/user-account/:account_id', getSingleUserAccountByUserIdAndId);

router.post('/user-account/create', createNewAccount);

export default router;
