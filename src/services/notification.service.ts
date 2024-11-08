import {
  allUserNotifications,
  singleUserNotification,
  deleteANotification,
} from '../repository/notifications';

const getAllUserNotifications = async (user_id: string) => {
  const response = await allUserNotifications(user_id);
  return response;
};

const getSingleUserNotification = async (
  user_id: string,
  notification_id: string
) => {
  const response = await singleUserNotification(user_id, notification_id);

  return response;
};

const deleteSingleUserNotification = async (
  user_id: string,
  notification_id: string
) => {
  const response = await deleteANotification(user_id, notification_id);

  return response;
};

export {
  getAllUserNotifications,
  getSingleUserNotification,
  deleteSingleUserNotification,
};
