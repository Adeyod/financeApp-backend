import {
  generateAccountNumber,
  saveAccountNumber,
} from '../repository/account.repository';
import {
  getAllUserAccountsById,
  getSingleUserAccountsById,
  getUserAccountByAccountNumber,
  // getSingleUserAccountsByAccountNumber
} from '../repository/account.repository';
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

export {
  getReceiverAccount,
  getSingleUserAccountUsingAccountNumber,
  createNewUserAccount,
  getAllUserAccountsUserId,
  getSingleUserAccountUserIdAndId,
};
