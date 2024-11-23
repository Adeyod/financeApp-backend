import express from 'express';
import {
  getUserNotifications,
  getUserSingleNotification,
  deleteUserSingleNotification,
  deleteUserManyNotifications,
  markNotificationAsViewed,
  markNotificationAsRead,
} from '../controllers/notification.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/user-notifications', getUserNotifications);
router.put('/user-notifications/view', markNotificationAsViewed);
router.put('/user-notifications/read/:notification_id', markNotificationAsRead);
router.get('/user-notifications/:notification_id', getUserSingleNotification);
router.delete(
  '/user-notifications/:notification_id',
  deleteUserSingleNotification
);
router.post('/user-notifications/delete-many', deleteUserManyNotifications);

export default router;
