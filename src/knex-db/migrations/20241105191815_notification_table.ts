import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title').notNullable();
    table.string('message').notNullable();
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  return await knex.schema.dropTableIfExists('notifications');
};
