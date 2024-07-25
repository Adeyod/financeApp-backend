"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("../constants/env");
const pool = new pg_1.Pool({
    user: env_1.POSTGRES_USER,
    host: env_1.POSTGRES_HOST,
    database: env_1.POSTGRES_DATABASE,
    password: env_1.POSTGRES_PASSWORD,
    port: 5432,
});
exports.pool = pool;
pool.on('connect', (client) => {
    console.log('Connected to the Database');
});
pool.on('error', (err, client) => {
    console.error('Unable to connect to the Database', err);
});
