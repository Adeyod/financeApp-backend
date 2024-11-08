import { BankDataReturnType } from '../constants/types';
import { knexConnect } from '../knex-db/knex';

const getABank = async (code: string): Promise<BankDataReturnType> => {
  const result = await knexConnect<BankDataReturnType>('banks')
    .select('*')
    .where('code', code)
    .first();
  return result as BankDataReturnType;
};

export { getABank };
