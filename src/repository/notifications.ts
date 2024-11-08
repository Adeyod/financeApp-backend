import { NotificationDocument, NotificationProp } from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { AppError } from '../utils/app.error';

const createNotificationMessage = async (payload: NotificationProp) => {
  const { title, user_id, message } = payload;

  const response = await knexConnect<NotificationDocument>(
    'notifications'
  ).insert({
    title,
    user_id,
    message,
  });

  return response;
};

const allUserNotifications = async (
  user_id: string
): Promise<NotificationDocument[]> => {
  const notifications = await knexConnect<NotificationDocument>('notifications')
    .select('*')
    .where('user_id', user_id);

  return notifications;
};

const singleUserNotification = async (
  user_id: string,
  notification_id: string
): Promise<NotificationDocument> => {
  const notification = await knexConnect<NotificationDocument>('notifications')
    .select('*')
    .where('user_id', user_id)
    .andWhere('id', notification_id)
    .first();

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  return notification;
};

const deleteANotification = async (
  user_id: string,
  notification_id: string
): Promise<NotificationDocument> => {
  const notification = await knexConnect<NotificationDocument>('notifications')
    .delete('*')
    .where('user_id', user_id)
    .andWhere('id', notification_id)
    .first();

  if (!notification) {
    throw new AppError('Unable to delete notification.', 404);
  }

  return notification;
};

export {
  createNotificationMessage,
  allUserNotifications,
  singleUserNotification,
  deleteANotification,
};
