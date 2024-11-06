import "dotenv/config";
const getEnv = (key: string, defaultVal?: string): string => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`MIssing enviroment variable in .env file - ${key}`);
  }
  return value;
};
export const NODE_ENV = getEnv("NODE_ENV", "dev");
export const PORT = getEnv("PORT", "5000");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const JWT_ACCESS_EXPIRES_IN = getEnv("JWT_ACCESS_EXPIRES_IN", "15m");
export const JWT_REFRESH_EXPIRES_IN = getEnv("JWT_REFRESH_EXPIRES_IN", "30d");
export const APP_VERSION = getEnv("APP_VERSION", "1.1.1");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const MONGO_DB_PASS = getEnv("MONGO_DB_PASS");
