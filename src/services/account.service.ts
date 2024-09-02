import {
  generateAccountNumber,
  saveAccountNumber,
} from '../repository/account.repository';
import {
  getAllUserAccountsById,
  getSingleUserAccountsById,
} from '../repository/user.repository';
import { AppError } from '../utils/app.error';

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

export {
  createNewUserAccount,
  getAllUserAccountsUserId,
  getSingleUserAccountUserIdAndId,
};
