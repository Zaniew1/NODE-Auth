import redisClient from "./redisClient";
import { serializeCache, deserializeCache, FlatObject } from "./serialize";

export const setCacheUser = async <T extends object>(id: number, attributes: T) => {
  const userData = serializeCache<T>(attributes);
  try {
    await redisClient.HSET(`user#${id}`, userData);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getCacheUser = async <T extends object>(id: number) => {
  try {
    const user: FlatObject = await redisClient.HGETALL(`user#${id}`);
    return deserializeCache<T>(user);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const deleteCacheUserById = async (id: number) => {
  try {
    await redisClient.DEL(`user#${id}`);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
