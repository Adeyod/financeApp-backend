import knex from 'knex';
import config from '../knexfile';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.NEON_CONNECTION_STRING) {
  throw new Error(
    'NEON_CONNECTION_STRING is not defined in the environment variables'
  );
}

const environment = 'production' as const;

const knexConfig = config[environment];

export const knexConnect = knex(knexConfig);
