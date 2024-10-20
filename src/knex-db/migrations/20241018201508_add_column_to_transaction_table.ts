import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.string('receiver_account_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.dropColumn('receiver_account_name');
  });
}
