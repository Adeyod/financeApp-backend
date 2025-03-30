import {
  allUserNotifications,
  singleUserNotification,
  deleteANotification,
  deleteAllNotifications,
} from '../repository/notifications';

const getAllUserNotifications = async (
  user_id: string,
  page: number = 1,
  limit: number = 10,
  searchParams: string
) => {
  const offset = (page - 1) * limit;

  console.log('user_id', user_id);
  console.log('page', page);
  console.log('limit', limit);
  console.log('searchParams', searchParams);

  const response = await allUserNotifications(
    user_id,
    limit,
    offset,
    searchParams
  );

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

const deleteManyUserNotifications = async (
  user_id: string,
  notification_ids: string[]
) => {
  const response = await deleteAllNotifications(user_id, notification_ids);

  return response;
};

export {
  getAllUserNotifications,
  getSingleUserNotification,
  deleteSingleUserNotification,
  deleteManyUserNotifications,
};
