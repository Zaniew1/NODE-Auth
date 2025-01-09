import redisClient from "./redisClient";
import { serializeCache, deserializeCache, FlatObject } from "./serialize";

export const setCacheVerificationCode = async <T extends object>(id: number, attributes: T) => {
  const verificationCodeData = serializeCache<T>(attributes);
  try {
    await redisClient.HSET(`verificationCode#${id}`, verificationCodeData);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getCacheVerificationCode = async <T extends object>(id: number) => {
  try {
    const verificationCode: FlatObject = await redisClient.HGETALL(`verificationCode#${id}`);
    return deserializeCache<T>(verificationCode);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const deleteCacheVerificationCodeById = async (id: number) => {
  try {
    await redisClient.DEL(`verificationCode#${id}`);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
