import express from 'express';
import {
  getUserNotifications,
  getUserSingleNotification,
  deleteUserSingleNotification,
} from '../controllers/notification.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/user-notifications', getUserNotifications);
router.get('/user-notifications/:notification_id', getUserSingleNotification);
router.delete(
  '/user-notifications/:notification_id',
  deleteUserSingleNotification
);

export default router;
