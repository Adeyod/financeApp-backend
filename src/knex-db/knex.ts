import knex from 'knex';
import config from '../knexfile';
import dotenv from 'dotenv';
dotenv.config();

const environment = 'development';
// const environment = process.env.NODE_ENV || 'development';

if (!environment) {
  console.log('it is undefined');
  throw new Error('it is undefined');
}
// const environment = process.env.NODE_ENV || 'development';

const knexConfig = config[environment];

export const knexConnect = knex(knexConfig);
