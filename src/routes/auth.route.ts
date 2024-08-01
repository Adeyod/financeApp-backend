import { Router } from 'express';

import {
  registerUser,
  verifyUserEmail,
  loginUser,
  resendEmailVerificationLink,
  forgotPassword,
  resetPassword,
  phoneVerification,
} from '../controllers/auth.controller';
const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-email-verification', resendEmailVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId/:token', resetPassword);
router.get('/email-verification/:userId/:token', verifyUserEmail);
router.post('/phone-verification', phoneVerification);

export default router;
