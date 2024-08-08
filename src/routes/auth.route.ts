import { Router } from 'express';

import {
  registerUser,
  verifyUserEmail,
  loginUser,
  resendEmailVerificationLink,
  forgotPassword,
  resetPassword,
  sendPhoneVerificationCode,
  changePassword,
} from '../controllers/auth.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-email-verification', resendEmailVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId/:token', resetPassword);
router.get('/email-verification/:userId/:token', verifyUserEmail);
router.get(
  '/phone-verification-code/:user_id',
  verifyAccessToken,
  sendPhoneVerificationCode
);
router.post('/change-password/:user_id', verifyAccessToken, changePassword);

export default router;
