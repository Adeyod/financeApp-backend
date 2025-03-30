import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notifications', (table) => {
    table.renameColumn('user_id', 'sender');
    table
      .uuid('receiver')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('notifications', (table) => {
    table.renameColumn('sender', 'user_id');
    table.dropColumn('receiver');
  });
};
