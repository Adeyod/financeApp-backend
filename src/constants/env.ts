const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Invalid environment variable ${key}`);
  }

  return value;
};

export const PORT = getEnv('PORT');
export const FRONTEND_URL = getEnv('FRONTEND_URL');
