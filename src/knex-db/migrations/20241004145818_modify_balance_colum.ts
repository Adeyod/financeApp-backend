import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.decimal('balance', 15, 2).defaultTo('0.00').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.decimal('balance', 15, 2).defaultTo(null).alter();
  });
}
