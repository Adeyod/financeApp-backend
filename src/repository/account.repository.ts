import {
  AccountCreatedDetailsType,
  AccountCreationType,
  AccountCredit,
  InitializationType,
  MonnifyDataUpdate,
  TransactionDetails,
  UpdateTransferAccountType,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { AppError } from '../utils/app.error';
import { generateRandomCode, generateReferenceCode } from '../utils/codes';

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
  console.log('user_id', user_id);
  console.log('account_number', account_number);
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

const getAccountByAccountNumberOnly = async (
  account_number: string
): Promise<AccountCreatedDetailsType> => {
  console.log('account_number', account_number);
  const userAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where('account_number', account_number)
    .first();

  if (!userAccount) {
    throw new AppError('Account not found', 404);
  }

  return userAccount;
};

const updateAccountBalances = async ({
  sender,
  receiver,
  amount,
  description,
}: UpdateTransferAccountType) => {
  const reference_number = generateReferenceCode(10);
  const newReceivingAccountBalance = Number(receiver.balance) + Number(amount);
  const newSendingAccountBalance = Number(sender.balance) - Number(amount);
  await knexConnect.transaction(async (trk) => {
    await trk('accounts')
      .where({ account_number: receiver.account_number })
      .update({ balance: newReceivingAccountBalance.toString() });

    await trk('accounts')
      .where({ account_number: sender.account_number })
      .update({ balance: newSendingAccountBalance.toString() });

    await trk('transactions').insert({
      user_id: sender.user_id,
      amount: amount,
      transaction_type: 'debit',
      transaction_date: new Date(),
      transaction_status: 'completed',
      description: description,
      account_id: sender.id,
      reference_number: reference_number,
      account_number: sender.account_number,
      receiving_account: receiver.id,
    });
  });

  const updatedSender = {
    ...sender,
    balance: newSendingAccountBalance.toString(),
  };
  const updatedReceiver = {
    ...receiver,
    balance: newReceivingAccountBalance.toString(),
  };

  return {
    sender: updatedSender,
    receiver: updatedReceiver,
  };
};

const updateAccountBalance = async (data: MonnifyDataUpdate) => {
  // find transaction and update

  console.log('NAME OF RECEIVER:', data.monnifyResponse.receiving_bank_name);

  // find account and update account balance
  const userAccount = await getAccountByAccountNumberOnly(data.account_number);
  const newBalance =
    Number(userAccount.balance) - Number(data.monnifyResponse.amount);

  const response = await knexConnect.transaction(async (trk) => {
    const transactionUpdate = await trk('transactions')
      .where({ reference_number: data.monnifyResponse.reference })
      .andWhere({ transaction_status: 'pending' })
      .update({
        transaction_status: 'completed',
        receiving_bank_name: data.monnifyResponse.receiving_bank_name,
      })
      .returning('*');

    const accountUpdate = await trk('accounts')
      .where({ account_number: data.account_number })
      .update({ balance: newBalance })
      .returning('*');

    const updatedTransaction = transactionUpdate[0];
    const updatedAccount = accountUpdate[0];

    return { updatedTransaction, updatedAccount };
  });

  if (!response) {
    throw new Error('Unable to update');
  }

  return response;
};

export {
  updateAccountBalance,
  getAccountByAccountNumberOnly,
  updateAccountBalances,
  getAllUserAccountsById,
  getSingleUserAccountsById,
  getUserAccountByAccountNumber,
  saveAccountNumber,
  generateAccountNumber,
  creditUserAccountByUserIdAndAccountId,
};
