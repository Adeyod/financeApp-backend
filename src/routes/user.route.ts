import express from 'express';
import {
  getUserProfileById,
  uploadUserImage,
} from '../controllers/user.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
import upload from '../middlewares/multer';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/profile', getUserProfileById);
router.post('/upload-user-image', upload.single('file'), uploadUserImage);

export default router;
