import redisClient from "./redisClient";
import { serializeCache, deserializeCache } from "./serialize";
type FlatObject = Record<string, string>;

export const replaceCacheData = async <T extends object>(key: string, field: keyof T, value: string) => {
  try {
    return await redisClient.HSET(key, field as string, value as string);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const setHashCache = async <T extends object>(key: string, attributes: T) => {
  const data = serializeCache<T>(attributes);
  try {
    return await redisClient.HSET(key, data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getHashCache = async <T extends object>(key: string) => {
  try {
    const data: FlatObject = await redisClient.HGETALL(key);
    return deserializeCache<T>(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const deleteHashCacheById = async (key: string) => {
  try {
    return await redisClient.DEL(key);
  } catch (e) {
    console.log(e);
    return null;
  }
};
