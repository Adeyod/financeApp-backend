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
  logoutUser,
} from '../controllers/auth.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/logout', logoutUser);
router.post('/resend-email-verification', resendEmailVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId/:token', resetPassword);
router.get('/email-verification/:userId/:token', verifyUserEmail);

router.use(verifyAccessToken);
router.get('/phone-verification-code', sendPhoneVerificationCode);
router.post('/change-password', changePassword);

export default router;
