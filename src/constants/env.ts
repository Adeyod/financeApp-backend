const getEnv = (
  key: string,
  defaultValue?: string,
  type: 'string' | 'number' | 'boolean' = 'string'
): string | number | boolean => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Invalid environment variable ${key}`);
  }

  switch (type) {
    case 'number':
      const parsedNumber = parseInt(value, 10);
      if (isNaN(parsedNumber)) {
        throw new Error(`Environment variable ${key} is not a valid number`);
      }
      return parsedNumber;
    case 'boolean':
      return value.toLowerCase() === 'true';
    default:
      return value;
  }
};

export const PORT = getEnv('PORT', undefined, 'number') as number;

export const FRONTEND_URL = getEnv('FRONTEND_URL') as string;
export const JWT_SECRET = getEnv('JWT_SECRET') as string;
export const POSTGRES_USER = getEnv('POSTGRES_USER') as string;
export const POSTGRES_HOST = getEnv('POSTGRES_HOST') as string;
export const POSTGRES_DATABASE = getEnv('POSTGRES_DATABASE') as string;
export const POSTGRES_PASSWORD = getEnv('POSTGRES_PASSWORD') as string;

export const NODEMAILER_HOST = getEnv('NODEMAILER_HOST') as string;
export const NODEMAILER_SERVICE = getEnv('NODEMAILER_SERVICE') as string;
export const NODEMAILER_PORT = getEnv(
  'NODEMAILER_PORT',
  undefined,
  'number'
) as number;
export const NODEMAILER_SECURE = getEnv(
  'NODEMAILER_SECURE',
  undefined,
  'boolean'
) as boolean;
export const NODEMAILER_USER = getEnv('NODEMAILER_USER') as string;
export const NODEMAILER_PASS = getEnv('NODEMAILER_PASS') as string;
