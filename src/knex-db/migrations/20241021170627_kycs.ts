import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.schema.createTable('kyc_verifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('id_card').notNullable();
    table.jsonb('utility_bill').notNullable();
    table.jsonb('face_verification').notNullable();
    table
      .enu('status', ['pending', 'verified', 'rejected'])
      .defaultTo('pending');
    table.timestamps(true, true);
    table.string('rejected_reason').nullable();
  });

  return knex.schema.alterTable('users', (table) => {
    table.enu('account_tier', ['basic', 'standard']).defaultTo('basic');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('account_tier');
  });

  return knex.schema.dropTable('kyc_verifications');
}
