import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.string('receiving_bank_name').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.dropColumn('receiving_bank_name');
  });
}
