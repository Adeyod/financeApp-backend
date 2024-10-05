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

  console.log(accountSid, authToken);

  const client = twilio(accountSid, authToken);
  try {
    const result = await client.messages.create({
      body: `Your phone verification code is ${code}. Don't share it. This code expires in 10 minutes.`,
      to: phone_number,
      from: '+12345678901',
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

const saveImageToDatabase = async (
  profile_image: {
    url: string;
    public_id: string;
  },
  user_id: string
): Promise<PayloadWithoutPassword> => {
  const result = await knexConnect<PayloadWithoutPassword>('users')
    .update({ profile_image })
    .where('id', user_id)
    .returning('*');

  return result[0];
};

export {
  saveImageToDatabase,
  findUserById,
  findUserByUsername,
  updateUserPassword,
  newUserRegistration,
  findUserByEmail,
  updateUserVerification,
  sendSMS,
};
