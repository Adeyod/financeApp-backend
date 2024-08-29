import express from 'express';
import { getUserProfileById } from '../controllers/user.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/profile', getUserProfileById);

export default router;
