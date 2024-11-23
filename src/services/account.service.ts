import { AccountCreatedDetailsType } from '../constants/types';
import {
  generateAccountNumber,
  getAccountByAccountNumberOnly,
  saveAccountNumber,
  getUserAccountForAdmin,
} from '../repository/account.repository';
import {
  getAllUserAccountsById,
  getSingleUserAccountsById,
  getUserAccountByAccountNumber,
  fetchAllPlatformAccounts,
  // getSingleUserAccountsByAccountNumber
} from '../repository/account.repository';
import { findUserById } from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import { paystackFetchReceivingAccount } from '../utils/paystack';

const getAllUserAccountsUserId = async (user_id: string) => {
  const getAllUserAccount = await getAllUserAccountsById(user_id);
  if (!getAllUserAccount) {
    throw new AppError('Unable to get account numbers for this user', 404);
  }
  return getAllUserAccount;
};

const getSingleUserAccountUserIdAndId = async (
  user_id: string,
  account_id: string
) => {
  const getSingleUserAccount = await getSingleUserAccountsById(
    user_id,
    account_id
  );
  if (!getSingleUserAccount) {
    throw new AppError('Unable to get an account number for this user', 404);
  }
  return getSingleUserAccount;
};

const getSingleUserAccountUsingAccountNumber = async (
  user_id: string,
  account_number: string
) => {
  const getSingleUserAccount = await getUserAccountByAccountNumber(
    user_id,
    account_number
  );
  if (!getSingleUserAccount) {
    throw new AppError('Unable to get an account number for this user', 404);
  }
  return getSingleUserAccount;
};

const createNewUserAccount = async (user_id: string) => {
  const userAccounts = await getAllUserAccountsUserId(user_id);

  if (userAccounts.length === 5) {
    throw new AppError('User can not have more than 5 accounts', 400);
  }
  const accountNumber = await generateAccountNumber();

  const accountString = JSON.stringify(accountNumber);

  const newAccountCreated = await saveAccountNumber({
    user_id,
    accountNumber: accountString,
  });

  if (!newAccountCreated) {
    throw new Error('Unable to create account');
  }

  return newAccountCreated;
};

const getReceiverAccount = async (
  receivingAccount: string,
  bankCode: string
) => {
  const paystackResponse = await paystackFetchReceivingAccount(
    receivingAccount,
    bankCode
  );

  return paystackResponse;
};

const getReceivingFundFlowAccountDetails = async (receivingAccount: string) => {
  const response = await getAccountByAccountNumberOnly(receivingAccount);
  const userName = await findUserById(response.user_id);

  const userObj = {
    first_name: userName[0].first_name,
    last_name: userName[0].last_name,
  };

  return userObj;
};

const getAllAccountsOnPlatform = async (
  page: number = 1,
  limit: number = 10,
  searchParams: string
): Promise<{ totalCount: number; accounts: AccountCreatedDetailsType[] }> => {
  const offset = (page - 1) * limit;

  const accounts = await fetchAllPlatformAccounts(limit, offset, searchParams);

  return {
    totalCount: accounts.totalCount,
    accounts: accounts.accounts,
  };
};

const fetchSingleAccountOfAUserForAdmin = async (
  userId: string,
  account_id: string
) => {
  const response = await getUserAccountForAdmin(userId, account_id);

  const { password, ...others } = response;

  return others;
};

export {
  fetchSingleAccountOfAUserForAdmin,
  getAllAccountsOnPlatform,
  getReceivingFundFlowAccountDetails,
  getReceiverAccount,
  getSingleUserAccountUsingAccountNumber,
  createNewUserAccount,
  getAllUserAccountsUserId,
  getSingleUserAccountUserIdAndId,
};
