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
  user_id: string,
  limit: number = 10,
  offset: number = 0,
  searchParams: string
): Promise<{
  totalIsViewed: number;
  totalCount: number;
  notifications: NotificationDocument[];
}> => {
  const baseQuery = knexConnect<NotificationDocument>('notifications').where(
    'user_id',
    user_id
  );

  console.log(limit);

  if (searchParams) {
    baseQuery.andWhere((qb) => {
      qb.where(knexConnect.raw('title'), 'ILIKE', `%${searchParams}%`).orWhere(
        'message',
        'ILIKE',
        `%${searchParams}%`
      );
    });
  }

  const totalCountResult = await baseQuery
    .clone()
    .count<{ total: string }[]>('* as total')
    .first();

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const notifications = await baseQuery
    .clone()
    .select('*')
    .offset(offset)
    .limit(limit)
    .orderBy('created_at', 'desc');

  const totalViewed = await baseQuery
    .where('is_viewed', false)
    .clone()
    .select('*');

  const totalIsViewed = totalViewed.length;

  console.log('TOTAL NOT VIEWED:', totalIsViewed);

  return { totalIsViewed, totalCount, notifications };
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
    .andWhere('id', notification_id);

  if (!notification) {
    throw new AppError('Unable to delete notification.', 404);
  }

  return notification[0];
};

const deleteAllNotifications = async (
  user_id: string,
  notification_ids: string[]
): Promise<NotificationDocument[]> => {
  const notifications = await knexConnect<NotificationDocument>('notifications')
    .where('user_id', user_id)
    .whereIn('id', notification_ids)
    .returning('*')
    .del<NotificationDocument[]>();

  if (!notifications) {
    throw new AppError('Unable to delete notification.', 404);
  }

  return notifications;
};

const markUserNotificationAsViewed = async (
  user_id: string
): Promise<NotificationDocument[]> => {
  const notification = await knexConnect<NotificationDocument>('notifications')
    .where('user_id', user_id)
    .update({ is_viewed: true })
    .returning('*');

  if (!notification) {
    throw new AppError('Unable to delete notification.', 404);
  }

  return notification;
};

const markUserNotificationAsRead = async (
  user_id: string,
  notification_id: string
): Promise<NotificationDocument> => {
  const result = await knexConnect<NotificationDocument>('notifications')
    .where('user_id', user_id)
    .andWhere('id', notification_id)
    .update({ is_read: true })
    .returning('*');

  if (!result) {
    throw new AppError('Unable to delete notification.', 404);
  }

  const notification = result[0];
  console.log('notification', notification);

  return notification;
};

export {
  markUserNotificationAsRead,
  markUserNotificationAsViewed,
  createNotificationMessage,
  allUserNotifications,
  singleUserNotification,
  deleteANotification,
  deleteAllNotifications,
};
