import { AccountCreatedDetailsType } from '../constants/types';
import {
  getAllUserAccountsUserId,
  createNewUserAccount,
  getSingleUserAccountUserIdAndId,
  getSingleUserAccountUsingAccountNumber,
  getReceiverAccount,
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

const getReceiverAccountDetails = catchErrors(async (req, res) => {
  const { receivingAccount, bankCode } = await req.body;

  const response = await getReceiverAccount(receivingAccount, bankCode);
  if (!response) {
    throw new Error('Error getting receiver account details');
  }

  // console.log(response.data);
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

  return res.json({
    newAccount: createAccount,
  });
});

export {
  getReceiverAccountDetails,
  getSingleUserAccountByAccountNumber,
  createNewAccount,
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
};

/**
 * credit account
 * transfer money from one account to another
 * withdraw money from account to local bank
 */
