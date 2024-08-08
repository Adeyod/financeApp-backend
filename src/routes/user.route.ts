import express from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.get('/profile/:user_id', verifyAccessToken, getUserProfile);

export default router;
