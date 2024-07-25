import { Pool } from 'pg';
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} from '../constants/env';

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: 5432,
});

pool.on('connect', (client) => {
  console.log('Connected to the Database');
});

pool.on('error', (err, client) => {
  console.error('Unable to connect to the Database', err);
});

export { pool };
