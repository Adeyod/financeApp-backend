import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.table('users', (table) => {
    table
      .enu('role', ['customer', 'admin', 'super_admin'])
      .defaultTo('customer');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('role');
  });
};
