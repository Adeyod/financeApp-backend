import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('notifications', (table) => {
    table.renameColumn('sender', 'user_id');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('notifications', (table) => {
    table.renameColumn('sender', 'user_id');
  });
};
