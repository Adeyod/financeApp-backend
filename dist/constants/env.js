"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTGRES_PASSWORD = exports.POSTGRES_DATABASE = exports.POSTGRES_HOST = exports.POSTGRES_USER = exports.FRONTEND_URL = exports.PORT = void 0;
const getEnv = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Invalid environment variable ${key}`);
    }
    return value;
};
exports.PORT = getEnv('PORT');
exports.FRONTEND_URL = getEnv('FRONTEND_URL');
exports.POSTGRES_USER = getEnv('POSTGRES_USER');
exports.POSTGRES_HOST = getEnv('POSTGRES_HOST');
exports.POSTGRES_DATABASE = getEnv('POSTGRES_DATABASE');
exports.POSTGRES_PASSWORD = getEnv('POSTGRES_PASSWORD');
