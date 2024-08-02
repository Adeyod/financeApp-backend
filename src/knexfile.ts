import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',

    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: process.env.POSTGRES_PORT
        ? Number(process.env.POSTGRES_PORT)
        : undefined,
    },

    migrations: {
      directory: path.join(__dirname, './knex-db/migrations'),
      extension: 'ts',
    },

    seeds: {
      directory: path.join(__dirname, './knex-db/seeds'),
      extension: 'ts',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.NEON_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      // tableName: 'knex_migrations',
      directory: path.join(__dirname, './db/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, './db/seeds'),
      extension: 'ts',
    },
  },
};

export default config;
