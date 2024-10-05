import { Request, Response } from 'express';
import { getUserAccountByAccountNumber } from '../repository/account.repository';
import { findUserById } from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import {
  paystackCallBack,
  payStackInitialized,
  paystackResult,
} from '../utils/paystack';
import { TransactionDetails } from '../constants/types';
import { userTransactionsDetails } from '../repository/transaction.repository';

const userAccountCredit = async (
  account_number: string,
  amount: string,
  user_id: string
) => {
  const userExist = await findUserById(user_id);

  console.log(amount);

  const user = userExist[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const accountExist = await getUserAccountByAccountNumber(
    userExist[0].id,
    account_number
  );

  if (!accountExist) {
    throw new AppError('Account not found', 404);
  }

  const transactionInfo = {
    amount,
    account_number,
    email: userExist[0].email,
    user_id: userExist[0].id,
  };

  const paystackResponse = await payStackInitialized(transactionInfo);

  // create the instance of transaction inside the transaction table for the transaction

  // console.log('RESPONSE:', paystackResponse)
  return paystackResponse;
};

const getUserTransactionsWithUserId = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ totalCount: number; transactions: TransactionDetails[] }> => {
  // calculate offset(skip)
  const offset = (page - 1) * limit;

  console.log(page);
  console.log(limit);

  const transactionResponse = await userTransactionsDetails(
    userId,
    limit,
    offset
  );

  return {
    totalCount: transactionResponse.totalCount, // or get it from the DB call
    transactions: transactionResponse.transactions,
  };
};

const getTransactionResponse = async (req: Request, res: Response) => {
  const response = await paystackResult(req, res);
  return response;
};

const getCallBackResponse = async (reference: string) => {
  const result = await paystackCallBack(reference);

  return result;
};

export {
  getCallBackResponse,
  userAccountCredit,
  getTransactionResponse,
  getUserTransactionsWithUserId,
};
