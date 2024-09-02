import {
  DeleteTokenType,
  TokenSearchType,
  VerificationParams,
  VerificationQuery,
} from '../constants/types';
import { knexConnect } from '../knex-db/knex';

const createVerificationCode = async ({
  token,
  user_id,
  purpose,
  expires_at,
}: VerificationParams) => {
  const result = await knexConnect<VerificationQuery>('verification_code')
    .insert({
      token,
      user_id,
      purpose,
      expires_at,
    })
    .returning('*');
  return result;
};

const findToken = async ({ user_id, purpose, token }: TokenSearchType) => {
  let query = knexConnect<VerificationQuery>('verification_code')
    .select('*')
    .where({
      user_id,
      purpose,
    });

  console.log('I am checking for token');
  if (token) {
    query = query.andWhere({ token });
  }
  const getToken = await query;
  return getToken as VerificationQuery[];
};

const deleteToken = async ({ user_id, purpose, id }: DeleteTokenType) => {
  const deleteData = await knexConnect<VerificationQuery>('verification_code')
    .delete()
    .where({
      user_id,
      purpose,
      id,
    })
    .returning('*');
  return deleteData;
};

export { createVerificationCode, deleteToken, findToken };
