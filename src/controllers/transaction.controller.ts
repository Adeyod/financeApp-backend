import { findUserById } from '../repository/user.repository';
import {
  getCallBackResponse,
  getTransactionResponse,
  getUserTransactionsWithUserId,
  userAccountCredit,
  bankAccountCredit,
  getBankDetails,
  getSingleAccountTransactionsWithAccountNumber,
  transferMoneyRequest,
  getSingleUserTransaction,
  fundFlowTransfer,
} from '../services/transaction.service';
import { AppError } from '../utils/app.error';
import {
  getMonnifyAccessKey,
  initiateTransfer,
  // validateOtp,
} from '../utils/monnify';
import catchErrors from '../utils/tryCatch';

const getAllUserTransactionsWithQuery = catchErrors(async (req, res) => {
  console.log(' I am running here');
  const userId = req.user;
  const { page, limit, searchParams } = req.query;

  console.log('searchParams:', searchParams);
  console.log('page:', page);
  console.log('limit:', limit);

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  if (userId === undefined) {
    throw new AppError('Please login to access this resource.', 404);
  }

  const response = await getUserTransactionsWithUserId(
    userId.userId,
    Number(page),
    Number(limit),
    searchQuery
  );

  console.log(response);

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getUserSingleAccountTransactions = catchErrors(async (req, res) => {
  const { account_number } = req.params;
  const { page, limit, searchParams } = req.query;

  const user = req.user;

  if (!user) {
    throw new AppError('Please login to access this resource.', 400);
  }

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const results = await getSingleAccountTransactionsWithAccountNumber(
    account_number,
    Number(page),
    Number(limit),
    searchQuery
  );
  console.log('results:', results);

  return res.status(200).json({
    message: `All transactions for ${account_number} were successfully fetched.`,
    success: true,
    transactions: results.transactions,
    totalCount: results.totalCount,
    completed_transactions: results.completed_transactions,
    total_transactions: results.total_transactions,
  });
});

const creditUserAccount = catchErrors(async (req, res) => {
  const { account_number, amount } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const response = await userAccountCredit(account_number, amount, user.userId);

  console.log('CONTROLLER CREDIT:', response.response);

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

const bankTransfer = catchErrors(async (req, res) => {
  const user = req.user;
  const {
    narration,
    paying_account_number,
    receiving_account_number,
    bank_name,
    amount,
  } = req.body;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const response = await bankAccountCredit({
    paying_account_number,
    receiving_account_number,
    bank_name,
    amount,
    user_id: user.userId,
    narration,
  });
});
const inAppTransfer = catchErrors(async (req, res) => {});

const getBankDetailsAndCodes = catchErrors(async (req, res) => {
  const result = await getBankDetails();

  return res.status(200).json({
    totalBanks: result.length,
    success: true,
    message: 'Banks fetched successfully',
    banks: result,
  });
});

// const transferToOtherBank = catchErrors(async (req, res) => {
//   const {
//     receivingAccount,
//     bankCode,
//     receiverDetails,
//     amount,
//     selectedAccountNumber,
//   } = req.body;
//   const user = req.user;
//   if (!user) {
//     throw new AppError('Unable to verify user', 400);
//   }

//   const response = await transferMoneyRequest(
//     user.userId,
//     receiverDetails,
//     receivingAccount,
//     selectedAccountNumber,
//     bankCode,
//     amount
//   );
//   return res.status(200).json({
//     message: 'Money transferred successfully',
//   });
// });

const transferToFundFlowAccount = catchErrors(async (req, res) => {
  const {
    receiving_account_number,
    amount,
    selected_account_number,
    description,
  } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError('Not authorized', 400);
  }

  const response = await fundFlowTransfer({
    user_id: user.userId,
    receiving_account_number: receiving_account_number,
    selected_account_number: selected_account_number,
    amount: amount,
    description: description,
  });

  return res.status(200).json({
    message: 'Transfer successful',
    success: true,
    senderAccount: response.sender,
  });
});

const getUserSingleTransaction = catchErrors(async (req, res) => {
  const { transaction_id } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError('User not authenticated', 400);
  }
  console.log(transaction_id);

  const response = await getSingleUserTransaction(transaction_id, user.userId);

  return res.status(200).json({
    message: 'Transaction was successfully fetched',
    success: true,
    transaction: response,
  });
});

const transferToOtherBank = catchErrors(async (req, res) => {
  const {
    receivingAccount,
    bankCode,
    receiverDetails,
    amount,
    narration,
    selectedAccountNumber,
  } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError('Not authorized', 400);
  }

  const response = await transferMoneyRequest(
    user.userId,
    receiverDetails,
    receivingAccount,
    selectedAccountNumber,
    bankCode,
    narration,
    amount
  );

  if (!response) {
    throw new Error('Failed to transfer money');
  }

  return res.status(200).json({
    message: 'Transfer successful',
    success: true,
    account: response.updatedAccount,
    transaction: response.updatedTransaction,
  });
});

export {
  transferToFundFlowAccount,
  getUserSingleTransaction,
  transferToOtherBank,
  getBankDetailsAndCodes,
  getPaystackCallBack,
  getTransactionResponseFromPaystackWebhook,
  getAllUserTransactionsWithQuery,
  getUserSingleAccountTransactions,
  creditUserAccount,
  bankTransfer,
  inAppTransfer,
};
