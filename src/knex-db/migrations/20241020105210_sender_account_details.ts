import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.string('sender_account_number').nullable();
    table.string('sender_account_name').nullable();
    table.string('sender_bank_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.dropColumn('sender_bank_name');
    table.dropColumn('sender_account_name');
    table.dropColumn('sender_account_number');
  });
}
