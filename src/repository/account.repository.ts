import {
  AccountCreatedDetailsType,
  AccountCreationType,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';
import { generateRandomCode } from '../utils/codes';

const generateAccountNumber = async (): Promise<Number> => {
  let accountNumber: Number = 0;
  let isUnique = false;

  while (!isUnique) {
    accountNumber = generateRandomCode(10);

    const accountExists = await knexConnect('accounts')
      .select()
      .where('account_number', accountNumber)
      .first();

    if (!accountExists) {
      isUnique = true;
    }
  }
  return accountNumber;
};

const saveAccountNumber = async ({
  user_id,
  accountNumber,
}: AccountCreationType) => {
  const hasAccount = await knexConnect<AccountCreatedDetailsType>('accounts')
    .select('*')
    .where({
      user_id: user_id,
    });

  let query = knexConnect<AccountCreatedDetailsType>('accounts')
    .insert({
      user_id: user_id,
      account_number: accountNumber,
      is_default: hasAccount.length === 0,
    })
    .returning('*');

  const saveAccount = await query;

  if (!saveAccount) {
    throw new Error('Unable to save account');
  }

  return saveAccount;
};

export { saveAccountNumber, generateAccountNumber };
