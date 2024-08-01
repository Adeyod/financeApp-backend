import type { Knex } from 'knex';
import path from 'path';
import {
  PORT,
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} from './constants/env';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'Adebolu@6910',
      database: 'fintech_app',
      port: 5432,
    },

    // connection: {
    //   host: process.env.POSTGRES_HOST,
    //   user: process.env.PG_USER,
    //   password: process.env.POSTGRES_PASSWORD,
    //   database: process.env.POSTGRES_DATABASE,
    //   port: 5432,
    // },
    // connection: {
    //   host: POSTGRES_HOST,
    //   user: PG_USER,
    //   password: POSTGRES_PASSWORD,
    //   database: POSTGRES_DATABASE,
    //   port: 5432,
    // },

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
    // connection: 'postgres://avnadmin:AVNS_fW9NM5z5xkMWcKdAueJ@pg-6910-ayodeji-testing.j.aivencloud.com:19666/defaultdb?sslmode=require',
    connection: {
      database: 'defaultdb',
      user: 'avnadmin',
      password: 'AVNS_fW9NM5z5xkMWcKdAueJ',
      host: 'pg-6910-ayodeji-testing.j.aivencloud.com',
      port: 19666,
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
