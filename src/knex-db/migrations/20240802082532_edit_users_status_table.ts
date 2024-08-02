import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // await knex.schema.alterTable('users', (table) => {
  // table.dropColumn('status');

  // table
  //   .enu(
  //     'status',
  //     ['active', 'inactive']
  //   {
  //   useNative: true,
  //   enumName: 'user_status',
  // }
  // )
  // .defaultTo('active')
  // .alter();

  // });

  await knex.schema.alterTable('users', (table) => {
    table.string('status').defaultTo('active').notNullable().alter();
  });

  // Update existing NULL values
  await knex('users').whereNull('status').update({ status: 'active' });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('status').nullable().alter();
  });
  // await knex.schema.alterTable('users', (table) => {
  //   // table.dropColumn('status');
  //   table
  //     .enu(
  //       'status',
  //       ['active', 'inactive']
  //       //   {
  //       //   useNative: true,
  //       //   enumName: 'user_status',
  //       // }
  //     )
  //     .defaultTo('active')
  //     .alter();
  // });
}
