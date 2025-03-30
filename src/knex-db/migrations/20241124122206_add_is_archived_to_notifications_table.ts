import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table('notifications', (table) => {
    table.boolean('is_archived').defaultTo(false);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table('notifications', (table) => {
    table.dropColumn('is_archived');
  });
};
