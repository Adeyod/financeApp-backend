import { AccountCreatedDetailsType } from '../constants/types';
import {
  getAllUserAccountsUserId,
  createNewUserAccount,
  getSingleUserAccountUserIdAndId,
} from '../services/account.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getAllUserAccountsByUserId = catchErrors(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const userAccounts = await getAllUserAccountsUserId(user.userId);

  console.log(userAccounts);

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

const createNewAccount = catchErrors(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  console.log(user.userId);

  const createAccount = await createNewUserAccount(user.userId);

  return res.json({
    newAccount: createAccount,
  });
});

export {
  createNewAccount,
  getAllUserAccountsByUserId,
  getSingleUserAccountByUserIdAndId,
};

/**
 * credit account
 * transfer money from one account to another
 * withdraw money from account to local bank
 */
