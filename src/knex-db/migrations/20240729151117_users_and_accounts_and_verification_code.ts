import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return await knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.enu('status', ['active', 'inactive']).defaultTo('active');
      table.string('user_name').unique().notNullable();
      table.string('email').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.text('password').notNullable();
      table.string('phone_number');
      table.boolean('two_fa_enabled').defaultTo(false);
      table.boolean('biometric_enabled').defaultTo(false);
      table.boolean('is_verified').defaultTo(false);
      table.boolean('is_updated').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('accounts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('account_number', 10).notNullable().unique();
      table.decimal('balance', 15, 2).defaultTo(0.0);
      table.boolean('is_default').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('verification_code', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.string('purpose').notNullable();
      table.timestamps(true, true);
    })
    .createTable('otps', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('otp').notNullable();
      table.string('phone_number').notNullable();
      table.boolean('is_used').defaultTo(false);
      table.timestamp('expires_at').notNullable();
      table.timestamps(true, true);
    })
    .createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.decimal('amount', 15, 2).notNullable();
      table.enu('transaction_type', ['credit', 'debit']).notNullable();
      table.date('transaction_date').defaultTo(knex.fn.now());
      table
        .enu('transaction_status', ['pending', 'completed'])
        .defaultTo('pending');
      table.string('description', 50).notNullable();
      table
        .uuid('account_id')
        .references('id')
        .inTable('accounts')
        .onDelete('CASCADE');

      table.string('reference_number', 50).unique();
      table.timestamps(true, true);
      table.string('transaction_source', 50);
    })
    .createTable('transfers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('from_account_id')
        .references('id')
        .inTable('accounts')
        .onDelete('CASCADE');

      table
        .uuid('to_account_id')
        .references('id')
        .inTable('accounts')
        .onDelete('CASCADE');
      table.decimal('amount', 15, 2).notNullable();
      table.timestamp('transfer_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

export const down = async (knex: Knex): Promise<void> => {
  return await knex.schema
    .dropTableIfExists('verification_code')
    .dropTableIfExists('otps')
    .dropTableIfExists('transactions')
    .dropTableIfExists('transfers')
    .dropTableIfExists('accounts')
    .dropTableIfExists('users');
};
