import {
  deleteSingleUserNotification,
  getAllUserNotifications,
  getSingleUserNotification,
} from '../services/notification.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getUserNotifications = catchErrors(async (req, res) => {
  const user = req.user;

  console.log(user);

  if (!user) {
    throw new AppError(
      'Please login to continue because user can not be found in the header.',
      404
    );
  }

  const response = await getAllUserNotifications(user?.userId);
  console.log(response);

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

export {
  getUserNotifications,
  deleteUserSingleNotification,
  getUserSingleNotification,
};
