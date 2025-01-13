import redisClient from "./redisClient";
import { serializeCache, deserializeCache, FlatObject } from "./serialize";
import { UserDocument } from "../user/model/user.model";
type UserIdType = UserDocument["_id"];

export const setCacheUser = async <T extends object>(id: UserIdType, attributes: T) => {
  const userData = serializeCache<T>(attributes);
  try {
    await redisClient.HSET(`user#${id}`, userData);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getCacheUserById = async <T extends object>(id: UserIdType) => {
  try {
    const user: FlatObject = await redisClient.HGETALL(`user#${id}`);
    return deserializeCache<T>(user);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getCacheUserByMail = async <T extends object>(mail: string) => {
  try {
    // const user: FlatObject = await redisClient.HGETALL(`user#${id}`);
    // return deserializeCache<T>(user);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const deleteCacheUserById = async (id: UserIdType) => {
  try {
    await redisClient.DEL(`user#${id}`);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
