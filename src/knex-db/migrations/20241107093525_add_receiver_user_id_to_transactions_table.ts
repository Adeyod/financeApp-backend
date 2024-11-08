import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table('transactions', (table) => {
    table.uuid('receiver_user_id').nullable();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table('transactions', (table) => {
    table.dropColumn('receiver_user_id');
  });
};
