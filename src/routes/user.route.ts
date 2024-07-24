import { Router } from 'express';

import {
  registerUser,
  verifyUserEmail,
  loginUser,
  resendEmailVerificationLink,
  forgotPassword,
  resetPassword,
} from '../controllers/user.controller';
const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-email-verification', resendEmailVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/email-verification/:userId/:token', verifyUserEmail);

export default router;
