import {
  allUserNotifications,
  createNotificationMessage,
} from '../repository/notifications';
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
  getSingleBankDetailsByCode,
  getPaystackStatusResponse,
  getAllPlatformTransactions,
  getAllPlatformCompletedTransactions,
  getAllPlatformPendingTransactions,
  getSingleTransactionForAdmin,
} from '../services/transaction.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getAllUserTransactionsWithQuery = catchErrors(async (req, res) => {
  const userId = req.user;
  const { page, limit, searchParams } = req.query;

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

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getAllCompletedTransactions = catchErrors(async (req, res) => {
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllPlatformCompletedTransactions(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getAllPendingTransactions = catchErrors(async (req, res) => {
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllPlatformPendingTransactions(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getAllTransactions = catchErrors(async (req, res) => {
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllPlatformTransactions(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Transactions fetched successfully',
    success: true,
    transactions: response,
  });
});

const getSingleUserTransactionForAdmin = catchErrors(async (req, res) => {
  const { transaction_id } = req.params;

  const response = await getSingleTransactionForAdmin(transaction_id);

  return res.status(200).json({
    message: 'Transaction fetched successfully',
    success: true,
    transaction: response,
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

  console.log(response.response.data.data);

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

    console.log('WEBHOOK:', paystackResponse);

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

  console.log('reference:', req.query.reference);

  const response = await getCallBackResponse(req.query.reference);

  if (!response) {
    throw new Error('Unable to verify payment');
  }

  const { transactionUpdate, accountUpdate } = response;

  const accountHolder = await findUserById(transactionUpdate.user_id);
  const account = accountUpdate[0];

  const { password, ...others } = accountHolder[0];

  const payload = {
    title: 'Your account credited successfully',
    message: `Your account number ${account.id} has been credited successfully with ${response.transactionUpdate.amount} naira and this account has new balance of ${accountUpdate[0].balance}`,
    user_id: accountUpdate[0].user_id,
  };

  const newNotification = await createNotificationMessage(payload);

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

  const payload = {
    title: 'You made a transfer',
    message: `You transferred ${response.amount} to ${response.receiving_account_number}. The tranfer was made from ${response.paying_account_number}.`,
    user_id: user.userId,
  };

  if (response) {
    const createNotification = await createNotificationMessage(payload);
  }
});

const getBankDetailsAndCodes = catchErrors(async (req, res) => {
  const result = await getBankDetails();

  return res.status(200).json({
    totalBanks: result.length,
    success: true,
    message: 'Banks fetched successfully',
    banks: result,
  });
});

const transferToFundFlowAccount = catchErrors(async (req, res) => {
  const {
    receiving_account_number,
    amount,
    selected_account_number,
    description,
    receiver_account_name,
  } = req.body;

  const user = req.user;

  if (!user) {
    throw new AppError('Not authorized', 400);
  }

  if (receiving_account_number === selected_account_number) {
    throw new AppError(
      'You can not send money from same account to same account',
      401
    );
  }

  const response = await fundFlowTransfer({
    user_id: user.userId,
    receiving_account_number: receiving_account_number,
    selected_account_number: selected_account_number,
    amount: amount,
    description: description,
    receiver_account_name,
  });

  if (response) {
    const creditor = await findUserById(user.userId);

    const payload = {
      title: 'Transfer successful',
      user_id: user.userId,
      message: `You have successfully transferred ${amount} to ${receiver_account_name}.`,
    };

    const payload2 = {
      title: 'Account credited successfully',
      user_id: response.receiver.user_id,
      message: `Your account ${receiving_account_number} has been credited with the sum of ${amount} by ${creditor[0].first_name} ${creditor[0].last_name}.`,
    };

    const newNotification = await createNotificationMessage(payload);
    const notifyReceiver = await createNotificationMessage(payload2);
  }

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

  const bankDetails = await getSingleBankDetailsByCode(bankCode);
  const payload = {
    title: 'Transfer successful',
    message: `You have successfully transferred #${amount} from ${selectedAccountNumber} account to ${receiverDetails?.account_name}'s ${bankDetails.name} account ${receivingAccount}`,
    user_id: user.userId,
  };
  const notifySender = await createNotificationMessage(payload);

  return res.status(200).json({
    message: 'Transfer successful',
    success: true,
    account: response.updatedAccount,
    transaction: response.updatedTransaction,
  });
});

const getPaystacktransactionStatus = catchErrors(async (req, res) => {
  const { reference } = req.params;
  console.log('CONTROLLER REFERENCE:', reference);
  const response = await getPaystackStatusResponse(reference);
});

export {
  getSingleUserTransactionForAdmin,
  getAllCompletedTransactions,
  getAllPendingTransactions,
  getAllTransactions,
  getPaystacktransactionStatus,
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
};
