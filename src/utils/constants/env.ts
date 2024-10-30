import "dotenv/config";
const getEnv = (key: string, defaultVal?: string): string => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`MIssing enviroment variable in .env file - ${key}`);
  }
  return value;
};

export const NODE_ENV = getEnv("NODE_ENV", "development");
export const PORT = getEnv("PORT", "4000");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const JWT_EXPIRES_IN = getEnv("JWT_EXPIRES_IN");
export const APP_VERSION = getEnv("APP_VERSION");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
