import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('transactions', (table) => {
    table.string('description', 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transactions', (table) => {
    table.string('description', 50).notNullable().alter();
  });
}
