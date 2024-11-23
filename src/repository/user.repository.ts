import twilio from 'twilio';

import {
  AccountCreatedDetailsType,
  Payload,
  PayloadWithoutPassword,
  ResetPasswordDocument,
  SmsType,
  UserDocument,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { AppError } from '../utils/app.error';
import { createNotificationMessage } from './notifications';

const updateUserVerification = async (user_id: string) => {
  const updateResult = await knexConnect<UserDocument>('users')
    .where({
      id: user_id,
    })
    .update({
      is_verified: true,
    })
    .returning('*');
  return updateResult;
};

const findUserByEmail = async (email: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('email', email);
  return user;
};

const findUserById = async (user_id: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('id', user_id);

  return user;
};

const findUserByIdFirst = async (user_id: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('id', user_id)
    .first();

  return user;
};

const findCustomerForAdmin = async (user_id: string) => {
  const userDetails = await knexConnect<UserDocument>('users')
    .select('users.*')
    .where('users.id', user_id)
    .andWhere('users.role', 'customer')
    .first();

  if (!userDetails) {
    throw new AppError('User not found.', 404);
  }

  const { password, ...others } = userDetails;

  const accounts = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('user_id', user_id);

  return { user: others, accounts };
};

const findAdminForSuperAdmin = async (user_id: string) => {
  const userDetails = await knexConnect<UserDocument>('users')
    .select('users.*')
    .where('users.id', user_id)
    .andWhere('users.role', 'admin')
    .first();

  if (!userDetails) {
    throw new AppError('User not found.', 404);
  }

  const { password, ...others } = userDetails;

  const accounts = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('user_id', user_id);

  return { user: others, accounts };
};

const adminChangedToCustomer = async (admin_id: string) => {
  const userDetails = await knexConnect<UserDocument>('users')
    .update('role', 'customer')
    .where('users.id', admin_id)
    .andWhere('users.role', 'admin');

  if (!userDetails) {
    throw new AppError('User not found.', 404);
  }

  const payload = {
    title: 'Role Change Notification',
    message: `Your role has been changed to a customer.`,
    user_id: admin_id,
  };

  const newNotification = await createNotificationMessage(payload);

  return userDetails;
};

const findUserByUsername = async (user_name: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('user_name', user_name);
  return user;
};

const newUserRegistration = async ({
  user_name,
  first_name,
  last_name,
  email,
  phone_number,
  password,
}: Payload) => {
  const user = await knexConnect<UserDocument>('users')
    .insert({
      first_name,
      last_name,
      email,
      phone_number,
      password,
      user_name,
    })
    .returning('*');
  return user;
};

const updateUserPassword = async ({
  user_id,
  password,
}: Pick<ResetPasswordDocument, 'user_id' | 'password'>) => {
  const result = await knexConnect('users')
    .update({
      password,
    })
    .where('id', user_id)
    .returning('first_name');

  return result;
};

const sendSMS = async ({ code, phone_number }: SmsType): Promise<void> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;

  const client = twilio(accountSid, authToken);
  try {
    const result = await client.messages.create({
      body: `Your phone verification code is ${code}. Don't share it. This code expires in 10 minutes.`,
      to: phone_number,
      from: '+12345678901',
    });
  } catch (error) {
    console.error(error);
  }
};

const saveImageToDatabase = async (
  profile_image: {
    url: string;
    public_id: string;
  },
  user_id: string
): Promise<PayloadWithoutPassword> => {
  const result = await knexConnect<UserDocument>('users')
    .update({ profile_image })
    .where('id', user_id)
    .returning('*');

  if (!result) {
    throw new AppError('User not found', 404);
  }

  const { password, ...others } = result[0];

  return others;
};

const findAllUsers = async (): Promise<UserDocument[]> => {
  const result = await knexConnect<UserDocument>('users').select('*');

  return result;
};

const findAllAdmins = async (
  limit: number = 10,
  offset: number = 0,
  searchParams: string
): Promise<{ totalCount: number; result: UserDocument[] }> => {
  const baseQuery = knexConnect<UserDocument>('users').where('role', 'admin');

  if (searchParams) {
    baseQuery.andWhere((qb) => {
      qb.where(knexConnect.raw('user_name'), 'ILIKE', `%${searchParams}%`)
        .orWhere('email', 'ILIKE', `%${searchParams}%`)
        .orWhere('first_name', 'ILIKE', `%${searchParams}%`)
        .orWhere('last_name', 'ILIKE', `%${searchParams}%`);
    });
  }

  const totalCountResult = await baseQuery
    .clone()
    .count<{ total: string }[]>('* as total')
    .first();

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const result = await baseQuery
    .clone()
    .offset(offset)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return { totalCount, result };
};

const findAllCustomers = async (
  limit: number = 10,
  offset: number = 0,
  searchParams: string
): Promise<{ totalCount: number; result: UserDocument[] }> => {
  const baseQuery = knexConnect<UserDocument>('users').where(
    'role',
    'customer'
  );

  if (searchParams) {
    baseQuery.andWhere((qb) => {
      qb.where(knexConnect.raw('user_name'), 'ILIKE', `%${searchParams}%`)
        .orWhere('email', 'ILIKE', `%${searchParams}%`)
        .orWhere('first_name', 'ILIKE', `%${searchParams}%`)
        .orWhere('last_name', 'ILIKE', `%${searchParams}%`);
    });
  }

  const totalCountResult = await baseQuery
    .clone()
    .count<{ total: string }[]>('* as total')
    .first();

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const result = await baseQuery
    .clone()
    .offset(offset)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return { totalCount, result };
};

export {
  adminChangedToCustomer,
  findAdminForSuperAdmin,
  findCustomerForAdmin,
  findAllCustomers,
  findAllUsers,
  saveImageToDatabase,
  findUserById,
  findUserByUsername,
  updateUserPassword,
  newUserRegistration,
  findUserByEmail,
  updateUserVerification,
  sendSMS,
  findUserByIdFirst,
  findAllAdmins,
};
