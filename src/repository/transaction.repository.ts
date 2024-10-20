import {
  AccountCreatedDetailsType,
  DataType,
  InitializationType,
  TransactionDetails,
  TransactionResponse,
  BankDataReturnType,
  BankDataType,
  MonnifyPendingStatus,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { getUserAccountByAccountNumber } from './account.repository';

const userTransactionsDetails = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
  searchParams: string
): Promise<{ totalCount: number; transactions: TransactionDetails[] }> => {
  const baseQuery = knexConnect<TransactionDetails>('transactions').where(
    'user_id',
    userId
  );

  if (searchParams) {
    baseQuery.andWhere((qb) => {
      qb.where(
        knexConnect.raw('transaction_type::text'),
        'ILIKE',
        `%${searchParams}%`
      )
        .orWhere('transaction_status', 'ILIKE', `%${searchParams}%`)
        .orWhere('description', 'ILIKE', `%${searchParams}%`)
        .orWhere('account_number', 'ILIKE', `%${searchParams}%`)
        .orWhere(knexConnect.raw('amount::text'), 'ILIKE', `%${searchParams}%`);
    });
  }

  const totalCountResult = await baseQuery
    .clone()
    .count<{ total: string }[]>('* as total')
    .first();

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const transactions = await baseQuery
    .clone()
    .offset(offset)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return { totalCount, transactions };
};

const getSingleTransactionsByAccountNumber = async (
  account_number: string,
  limit: number = 10,
  offset: number = 0,
  searchParams: string
): Promise<{ totalCount: number; results: TransactionDetails[] }> => {
  const baseQuery = knexConnect<TransactionDetails>('transactions').where(
    'account_number',
    account_number
  );

  if (searchParams) {
    baseQuery.andWhere((qb) => {
      qb.where(
        knexConnect.raw('transaction_type::text'),
        'ILIKE',
        `%${searchParams}%`
      )
        .orWhere('transaction_status', 'ILIKE', `%${searchParams}%`)
        .orWhere('description', 'ILIKE', `%${searchParams}%`)
        .orWhere('account_number', 'ILIKE', `%${searchParams}%`)
        .orWhere(knexConnect.raw('amount::text'), 'ILIKE', `%${searchParams}%`);
    });
  }

  const totalCountResult = await baseQuery
    .clone()
    .count<{ total: string }[]>('* as total')
    .first();

  const totalCount = totalCountResult
    ? parseInt(totalCountResult.total, 10)
    : 0;

  const results = await baseQuery
    .clone()
    .offset(offset)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return { results, totalCount };
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

const saveInitializedCredit = async (data: InitializationType) => {
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

const saveLocalBankTransferTransaction = async (data: MonnifyPendingStatus) => {
  const transactionResult = await knexConnect<TransactionDetails>(
    'transactions'
  )
    .insert({
      user_id: data.user_id,
      amount: Number(data.amount),
      transaction_type: data.transaction_type,
      transaction_date: data.transaction_date,
      transaction_status: data.transaction_status,
      description: data.description,
      account_id: data.account_id,
      reference_number: data.reference_number,
      receiving_account_number: data.receiving_account,
      account_number: data.account_number,
      receiver_account_name: data.receiver_account_name,
    })
    .returning('*');
  return transactionResult;
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

const getAllBanks = async (): Promise<BankDataReturnType[]> => {
  const results = await knexConnect<BankDataReturnType>('banks').select('*');
  return results;
};

const getSingleTransactionByTransactionIdAndUserId = async (
  transaction_id: string,
  user_id: string
): Promise<TransactionDetails> => {
  const result = await knexConnect<TransactionDetails>('transactions')
    .select('*')
    .where('id', transaction_id)
    .andWhere('user_id', user_id)
    .first();

  return result as TransactionDetails;
};

const updateBankData = async (
  datas: BankDataType[]
): Promise<BankDataReturnType[]> => {
  const response = await Promise.all(
    datas.map(async (data) => {
      const existingBank = await knexConnect('banks')
        .where({ bank_id: data.id })
        .first();

      if (!existingBank) {
        const result = await knexConnect<BankDataReturnType>('banks').insert({
          bank_id: data.id,
          name: data.name,
          slug: data.slug,
          code: data.code,
          longcode: data.longcode,
          pay_with_bank: data.pay_with_bank,
          supports_transfer: data.supports_transfer,
          active: data.active,
          country: data.country,
          currency: data.currency,
          type: data.type,
          is_deleted: data.is_deleted,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
        return data;
      }

      return existingBank;
    })
  );

  return response;
};

export {
  saveLocalBankTransferTransaction,
  getSingleTransactionByTransactionIdAndUserId,
  getSingleTransactionsByAccountNumber,
  updateBankData,
  findTransactionByReferenceAndStatus,
  findTransactionByReference,
  userTransactionsDetails,
  updateUserTransaction,
  saveInitializedCredit,
  getAllBanks,
};
