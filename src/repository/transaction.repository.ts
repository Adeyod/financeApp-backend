import {
  AccountCreatedDetailsType,
  DataType,
  InitializationType,
  TransactionDetails,
  TransactionResponse,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { getUserAccountByAccountNumber } from './account.repository';

const userTransactionsDetails = async (
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ totalCount: number; transactions: TransactionDetails[] }> => {
  const totalCountResult = await knexConnect<TransactionDetails>('transactions')
    .count<{ total: string }[]>('* as total')
    .where('user_id', userId)
    .first();

  console.log('TOTAL COUNT', totalCountResult);

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const transactions = await knexConnect<TransactionDetails>('transactions')
    .where('user_id', userId)
    .offset(offset)
    .limit(limit);

  return { totalCount, transactions };
};

const findTransactionByReference = async (
  reference: string
): Promise<TransactionDetails> => {
  const transaction = await knexConnect<TransactionDetails>('transactions')
    .select('*')
    .where('reference_number', reference);

  return transaction[0];
};

const findTransactionByReferenceAndStatus = async (
  reference: string
): Promise<TransactionDetails[]> => {
  const transaction = await knexConnect<TransactionDetails>('transactions')
    .select('*')
    .where('reference_number', reference)
    .andWhere('transaction_status', 'pending');

  return transaction;
};

const saveInitializedTransaction = async (data: InitializationType) => {
  const getAccountNumber: AccountCreatedDetailsType =
    await getUserAccountByAccountNumber(data.user_id, data.account_number);

  const transactionResponse = await knexConnect<TransactionDetails>(
    'transactions'
  )
    .insert({
      user_id: data.user_id,
      amount: data.amount,
      transaction_type: data.transaction_type,
      transaction_status: data.transaction_status,
      description: data.description,
      account_number: data.account_number,
      account_id: getAccountNumber.id,
      reference_number: data.reference,
    })
    .returning('*');

  return transactionResponse;
};

const updateUserTransaction = async (
  data: DataType
): Promise<TransactionDetails> => {
  // Step 1: Update the transaction status
  const result = await knexConnect<TransactionDetails>('transactions')
    .where('reference_number', data.reference)
    .andWhere('account_number', data.account_number)
    .andWhere('user_id', data.user_id)
    .update('transaction_status', 'completed')
    .returning('*');

  return result[0];
};

export {
  findTransactionByReferenceAndStatus,
  findTransactionByReference,
  userTransactionsDetails,
  updateUserTransaction,
  saveInitializedTransaction,
};
