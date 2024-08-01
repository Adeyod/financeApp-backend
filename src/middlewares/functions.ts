import {
  Payload,
  VerificationParams,
  UserDocument,
  VerificationQuery,
  TokenSearchType,
  DeleteTokenType,
  AccountCreationType,
  ResetPasswordDocument,
  AccountCreatedDetailsType,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { generateRandomCode } from './codes';

const createVerificationCodeFunction = async ({
  token,
  user_id,
  purpose,
  expires_at,
}: VerificationParams) => {
  const result = await knexConnect<VerificationQuery>('verification_code')
    .insert({
      token,
      user_id,
      purpose,
      expires_at,
    })
    .returning('*');
  return result;
};

const findTokenFunction = async ({
  user_id,
  purpose,
  token,
}: TokenSearchType) => {
  let query = knexConnect<VerificationQuery>('verification_code')
    .select('*')
    .where({
      user_id,
      purpose,
    });

  if (token) {
    query = query.andWhere({ token });
  }
  const getToken = await query;
  return getToken as VerificationQuery[];
};

const deleteTokenFunction = async ({
  user_id,
  purpose,
  id,
}: DeleteTokenType) => {
  const deleteData = await knexConnect<VerificationQuery>('verification_code')
    .delete()
    .where({
      user_id,
      purpose,
      id,
    })
    .returning('*');
  return deleteData;
};

const updateUserVerificationFunction = async (user_id: string) => {
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

const findUserByEmailFunction = async (email: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('email', email);
  return user;
};

const findUserByUsername = async (user_name: string) => {
  const user = await knexConnect<UserDocument>('users')
    .select('*')
    .where('user_name', 'ILIKE', user_name);
  return user;
};

const registerNewUserFunction = async ({
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

const updateUserPasswordFunction = async ({
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

const generateAccountNumberFunction = async (): Promise<Number> => {
  let accountNumber: Number = 0;
  let isUnique = false;

  while (!isUnique) {
    accountNumber = generateRandomCode(10);

    const accountExists = await knexConnect('accounts')
      .select()
      .where('account_number', accountNumber)
      .first();

    if (!accountExists) {
      isUnique = true;
    }
  }
  return accountNumber;
};

const saveAccountNumberFunction = async ({
  user_id,
  accountNumber,
}: AccountCreationType) => {
  // check if the user has an account before
  const hasAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where({
      user_id: user_id,
    });

  console.log('hasAccount', hasAccount);

  let query = knexConnect<AccountCreatedDetailsType>('accounts')
    .insert({
      user_id: user_id,
      account_number: accountNumber,
      is_default: hasAccount.length === 0,
    })
    .returning('*');

  const saveAccount = await query;

  if (!saveAccount) {
    throw new Error('Unable to save account');
  }

  return saveAccount;
};

export {
  saveAccountNumberFunction,
  generateAccountNumberFunction,
  findUserByUsername,
  updateUserPasswordFunction,
  createVerificationCodeFunction,
  registerNewUserFunction,
  findUserByEmailFunction,
  deleteTokenFunction,
  findTokenFunction,
  updateUserVerificationFunction,
};
