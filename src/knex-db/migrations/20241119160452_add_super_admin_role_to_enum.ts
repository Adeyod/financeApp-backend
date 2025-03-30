import type { Knex } from 'knex';

// export const up = async (knex: Knex): Promise<void> => {
//   // Add the 'super_admin' value to the ENUM type 'role' if it doesn't exist
//   await knex.raw(`
//     DO $$
//     BEGIN
//       IF NOT EXISTS (
//         SELECT 1
//         FROM pg_type t
//         JOIN pg_enum e ON e.enumtypid = t.oid
//         WHERE t.typname = 'role' AND e.enumlabel = 'super_admin'
//       ) THEN
//         ALTER TYPE role ADD VALUE 'super_admin';
//       END IF;
//     END
//     $$;
//   `);
// };

// export const up = async (knex: Knex): Promise<void> => {
//   // Add 'super_admin' value to the ENUM 'role' in a specific schema
//   await knex.raw(`
//     DO $$
//     BEGIN
//       IF NOT EXISTS (
//         SELECT 1
//         FROM pg_type t
//         JOIN pg_enum e ON e.enumtypid = t.oid
//         WHERE t.typname = 'role' AND e.enumlabel = 'super_admin'
//       ) THEN
//         ALTER TYPE "name".role ADD VALUE 'super_admin';  -- Use the full schema-qualified type name
//       END IF;
//     END
//     $$;
//   `);
// };

// export const up = async (knex: Knex): Promise<void> => {
//   await knex.raw(`
//     DO $$
//     BEGIN
//       IF NOT EXISTS (
//         SELECT 1
//         FROM pg_type t
//         JOIN pg_enum e ON e.enumtypid = t.oid
//         WHERE t.typname = 'role' AND e.enumlabel = 'super_admin'
//       ) THEN
//         ALTER TYPE "name".role ADD VALUE 'super_admin';  -- Use the correct schema name here
//       END IF;
//     END
//     $$;
//   `);
// };

// export const down = async (knex: Knex): Promise<void> => {
//   // You cannot directly remove values from an ENUM, so no action is needed here
//   // If you need to remove the column, you could drop the 'role' column
//   return knex.schema.table('users', (table) => {
//     table.dropColumn('role');
//   });
// };

export const up = async (knex: Knex): Promise<void> => {
  return knex.raw(
    `
  ALTER TABLE "users"
  DROP CONSTRAINT "users_role_check",
  ADD CONSTRAINT "users_role_check"
  CHECK (role IN ('customer', 'admin', 'super_admin'))
  `
  );
};

export const down = async (knex: Knex): Promise<void> => {
  return knex.raw(`
    ALTER TABLE users
    CHECK (role IN ('customer', 'admin'))
  `);
};
