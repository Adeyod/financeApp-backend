import { findUserById } from '../repository/user.repository';
import {
  getCallBackResponse,
  getTransactionResponse,
  getUserTransactionsWithUserId,
  userAccountCredit,
} from '../services/transaction.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getAllUserTransactions = catchErrors(async (req, res) => {
  console.log('I am running here');
  const userId = req.user;
  const { page, limit } = req.query;
  console.log('USERID', userId);

  if (userId === undefined) {
    throw new AppError('Please login to access this resource.', 404);
  }

  const response = await getUserTransactionsWithUserId(
    userId.userId,
    Number(page),
    Number(limit)
  );
  console.log('CONTROLLER: ', response);

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getUserSingleAccountTransactions = catchErrors(async (req, res) => {});

const creditUserAccount = catchErrors(async (req, res) => {
  const { account_number, amount } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const response = await userAccountCredit(account_number, amount, user.userId);

  return res.json({
    message: 'Initialized account credit successfully',
    data: response.response.data.data,
    success: true,
  });
});

const getTransactionResponseFromPaystackWebhook = catchErrors(
  async (req, res) => {
    console.log('webhook is running');
    const paystackResponse = await getTransactionResponse(req, res);

    return res.json({
      message: 'Account credited successfully',
      success: true,
      data: paystackResponse,
    });
  }
);

const getPaystackCallBack = catchErrors(async (req, res) => {
  if (typeof req.query.reference !== 'string') {
    console.log('Invalid reference provided');
    throw new Error('Invalid reference provided');
  }

  const response = await getCallBackResponse(req.query.reference);

  if (!response) {
    throw new Error('Unable to verify payment');
  }

  const { transactionUpdate, accountUpdate } = response;

  const accountHolder = await findUserById(transactionUpdate.user_id);
  const account = accountUpdate[0];

  const { password, ...others } = accountHolder[0];

  return res.status(200).json({
    message: 'Credited account successfully',
    success: true,
    account,
    transaction: transactionUpdate,
    user: others,
  });
});

export {
  getPaystackCallBack,
  getTransactionResponseFromPaystackWebhook,
  getAllUserTransactions,
  getUserSingleAccountTransactions,
  creditUserAccount,
};
