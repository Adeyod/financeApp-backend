import {
  AccountCreatedDetailsType,
  NotificationProp,
} from '../constants/types';
import { createNotificationMessage } from '../repository/notifications';
import {
  getAllUserAccountsUserId,
  createNewUserAccount,
  getSingleUserAccountUserIdAndId,
  getSingleUserAccountUsingAccountNumber,
  getReceiverAccount,
  getReceivingFundFlowAccountDetails,
  getAllAccountsOnPlatform,
  fetchSingleAccountOfAUserForAdmin,
} from '../services/account.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getAllUserAccountsByUserId = catchErrors(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const userAccounts = await getAllUserAccountsUserId(user.userId);

  return res.json({
    message: 'Accounts fetched successfully',
    success: true,
    accounts: userAccounts,
  });
});

const getSingleUserAccountByUserIdAndId = catchErrors(async (req, res) => {
  const user = req.user;

  const { account_id } = req.params;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const userAccount = await getSingleUserAccountUserIdAndId(
    user.userId,
    account_id
  );

  return res.json({
    accounts: userAccount,
  });
});

const getSingleUserAccountByAccountNumber = catchErrors(async (req, res) => {
  const user = req.user;

  const { account_number } = req.params;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const userAccount = await getSingleUserAccountUsingAccountNumber(
    user.userId,
    account_number
  );

  return res.json({
    accounts: userAccount,
  });
});

const getReceivingFundFlowAccountUserDetails = catchErrors(async (req, res) => {
  const { account_number } = req.params;

  const response = await getReceivingFundFlowAccountDetails(account_number);
  if (!response) {
    throw new Error('Error getting receiver account details');
  }

  console.log('controller:', response);

  return res.status(200).json({
    message: 'Receiver Account Details fetched successfully',
    success: true,
    receiverDetails: response,
  });
});

const getReceiverAccountDetails = catchErrors(async (req, res) => {
  const { receivingAccount, bankCode } = await req.body;

  const response = await getReceiverAccount(receivingAccount, bankCode);
  if (!response) {
    throw new Error('Error getting receiver account details');
  }

  const details = {
    account_number: response?.data?.data?.account_number,
    account_name: response?.data?.data?.account_name,
  };

  return res.status(200).json({
    message: 'Receiver Account Details fetched successfully',
    success: true,
    receiverDetails: details,
  });
});

const createNewAccount = catchErrors(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const createAccount = await createNewUserAccount(user.userId);

  if (createAccount) {
    const notificationObj: NotificationProp = {
      title: 'New account number created successfully',
      user_id: user.userId,
      message: `A new account has been created successfully for you. Account number: ${createAccount[0].account_number}`,
    };

    const newNotification = await createNotificationMessage(notificationObj);
  }
  return;

  // return res.json({
  //   newAccount: createAccount,
  // });
});

const getAllAccounts = catchErrors(async (req, res) => {
  console.log('i am getting all accounts');
  const { limit, page, searchParams } = req.query;
  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllAccountsOnPlatform(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Accounts fetched successfully',
    success: true,
    accounts: response,
  });
});

const getSingleAccountOfAUserForAdmin = catchErrors(async (req, res) => {
  console.log('i am getting here');
  const { user_id, account_id } = req.params;
  console.log('user_id', user_id);
  console.log('account_id', account_id);

  const response = await fetchSingleAccountOfAUserForAdmin(user_id, account_id);

  if (response) {
    return res.status(200).json({
      message: 'Account info fetched successfully',
      success: true,
      accountDetails: response,
    });
  }
});

export {
  getSingleAccountOfAUserForAdmin,
  getAllAccounts,
  getReceivingFundFlowAccountUserDetails,
  getReceiverAccountDetails,
  getSingleUserAccountByAccountNumber,
  createNewAccount,
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
};
