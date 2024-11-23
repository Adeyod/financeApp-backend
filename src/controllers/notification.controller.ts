import {
  markUserNotificationAsViewed,
  markUserNotificationAsRead,
} from '../repository/notifications';
import {
  deleteManyUserNotifications,
  deleteSingleUserNotification,
  getAllUserNotifications,
  getSingleUserNotification,
} from '../services/notification.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getUserNotifications = catchErrors(async (req, res) => {
  const user = req.user;
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  if (!user) {
    throw new AppError(
      'Please login to continue because user can not be found in the header.',
      404
    );
  }

  const response = await getAllUserNotifications(
    user?.userId,
    Number(page),
    Number(limit),
    searchQuery
  );
  // console.log(response);

  return res.status(200).json({
    message: 'Notifications fetched successfully',
    success: true,
    notifications: response,
  });
});

const getUserSingleNotification = catchErrors(async (req, res) => {
  const user = req.user;
  const { notification_id } = req.params;

  if (!user) {
    throw new AppError(
      'Please login to continue because user can not be found in the header.',
      404
    );
  }

  // if(!notification_id){
  //   throw new AppError('Notification ID can not be undefined.', 404)
  // }

  const response = await getSingleUserNotification(
    user?.userId,
    notification_id
  );

  console.log(response);

  return res.status(200).json({
    message: 'Notification fetched successfully.',
    success: true,
    notifications: response,
  });
});

const deleteUserSingleNotification = catchErrors(async (req, res) => {
  const user = req.user;
  const { notification_id } = req.params;
  console.log('notification_id:', notification_id);

  if (!user) {
    throw new AppError(
      'Please login to continue because user can not be found in the header.',
      404
    );
  }

  // if(!notification_id){
  //   throw new AppError('Notification ID can not be undefined.', 404)
  // }

  const response = await deleteSingleUserNotification(
    user?.userId,
    notification_id
  );

  console.log(response);

  return res.status(200).json({
    message: 'Notification deleted successfully.',
    success: true,
    notifications: response,
  });
});
const deleteUserManyNotifications = catchErrors(async (req, res) => {
  const user = req.user;
  const { notification_ids } = req.body;

  console.log('notification_ids', notification_ids);

  if (!user) {
    throw new AppError(
      'Please login to continue because user can not be found in the header.',
      404
    );
  }

  // if(!notification_id){
  //   throw new AppError('Notification ID can not be undefined.', 404)
  // }

  const response = await deleteManyUserNotifications(
    user?.userId,
    notification_ids
  );

  console.log(response);

  return res.status(200).json({
    message: 'Notification deleted successfully.',
    success: true,
    notifications: response,
  });
});

const markNotificationAsViewed = catchErrors(async (req, res) => {
  const user = req?.user?.userId;
  console.log('controller user:', user);

  if (!user) {
    throw new AppError('Please login to view the notification', 401);
  }

  const response = await markUserNotificationAsViewed(user);

  return res.status(200).json({
    message: 'Notification has been marked as viewed',
    success: true,
    notifications: response,
  });
});

const markNotificationAsRead = catchErrors(async (req, res) => {
  const user = req?.user?.userId;
  const { notification_id } = req.params;
  console.log('CONTROLLER:', notification_id);
  console.log('CONTROLLER:', user);

  if (!user) {
    throw new AppError('Please login to view the notification', 401);
  }

  const response = await markUserNotificationAsRead(user, notification_id);

  return res.status(200).json({
    message: 'Notification has been marked as read',
    success: true,
    notification: response,
  });
});

export {
  deleteUserManyNotifications,
  markNotificationAsRead,
  markNotificationAsViewed,
  getUserNotifications,
  deleteUserSingleNotification,
  getUserSingleNotification,
};
