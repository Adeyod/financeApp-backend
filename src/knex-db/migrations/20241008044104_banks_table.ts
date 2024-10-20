import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return await knex.schema.createTable('banks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.integer('bank_id');
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table.string('code').notNullable();
    table.string('longcode');
    table.boolean('pay_with_bank').defaultTo(false);
    table.boolean('supports_transfer').defaultTo(false);
    table.boolean('active').defaultTo(true);
    table.string('country').notNullable();
    table.string('currency').notNullable();
    table.string('type').notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table.timestamp('createdAt').notNullable();
    table.timestamp('updatedAt').notNullable();
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return await knex.schema.dropTableIfExists('banks');
};
