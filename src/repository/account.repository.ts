import {
  AccountCreatedDetailsType,
  AccountCreationType,
  AccountCredit,
  InitializationType,
  TransactionDetails,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { AppError } from '../utils/app.error';
import { generateRandomCode } from '../utils/codes';

const generateAccountNumber = async (): Promise<Number> => {
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

const saveAccountNumber = async ({
  user_id,
  accountNumber,
}: AccountCreationType) => {
  const hasAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where({
      user_id: user_id,
    });

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

const creditUserAccountByUserIdAndAccountId = async ({
  user_id,
  account_number,
  amount,
}: AccountCredit): Promise<AccountCreatedDetailsType[]> => {
  console.log('AMOUNT:', amount);
  const accountResponse = await knexConnect<AccountCreatedDetailsType>(
    'accounts'
  )
    .where('user_id', user_id)
    .andWhere('account_number', account_number)
    .update({
      balance: knexConnect.raw('?? + ?', ['balance', amount]),
    })
    .returning('*');

  if (!accountResponse) {
    throw new AppError('Unable to update account', 400);
  }

  return accountResponse;
};

const getAllUserAccountsById = async (
  user_id: string
): Promise<AccountCreatedDetailsType[]> => {
  const userAccounts = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('user_id', user_id);

  const accounts = userAccounts;
  if (!accounts) {
    throw new AppError('No account found for this user', 404);
  }
  return accounts;
};

const getSingleUserAccountsById = async (
  user_id: string,
  account_id: string
): Promise<AccountCreatedDetailsType> => {
  const userAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('id', account_id)
    .andWhere('user_id', user_id)
    .first();

  if (!userAccount) {
    throw new AppError('Account not found', 404);
  }
  return userAccount;
};

const getUserAccountByAccountNumber = async (
  user_id: string,
  account_number: string
): Promise<AccountCreatedDetailsType> => {
  const userAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('account_number', account_number)
    .andWhere('user_id', user_id)
    .first();

  if (!userAccount) {
    throw new AppError('Account not found', 404);
  }

  return userAccount;
};

export {
  getAllUserAccountsById,
  getSingleUserAccountsById,
  getUserAccountByAccountNumber,
  saveAccountNumber,
  generateAccountNumber,
  creditUserAccountByUserIdAndAccountId,
};
