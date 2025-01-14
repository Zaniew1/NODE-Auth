import redisClient from "./redisClient";
import { serializeCache, deserializeCache, FlatObject } from "./serialize";
import { getHashCache } from "./methods";
import { UserDocument } from "../user/model/user.model";

/**
 * Create key for user hash in Redis
 *
 * @param {UserDocument["_id"]} id
 * @returns {string} returns redis hash -> user#123123123123123
 */
export const setUserHashKey = (id: UserDocument["_id"]): string => {
  return `user#${id}`;
};
/**
 * Set string in Redis where key is email and value is userID
 *
 * @async
 * @param {UserDocument["_id"]} id
 * @param {string} email
 * @returns { Promise<string | null>} returns "OK" or null
 */
export const setUserUniqueEmailCache = async (id: UserDocument["_id"], email: string): Promise<string | null> => {
  try {
    return await redisClient.SET(`email:${email}`, String(id));
  } catch (e) {
    console.log(e);
    return null;
  }
};
/**
 * Get userID from Redis string where key is email and value is userID
 *
 * @async
 * @param {string} email
 * @returns {Promise<UserDocument["_id"] | null>} returns user id or null
 */
export const getUserIdByUniqueEmailCache = async (email: string): Promise<UserDocument["_id"] | null> => {
  try {
    return await redisClient.GET(`email:${email}`);
  } catch (e) {
    console.log(e);
    return null;
  }
};
/**
 * Get user by its mail from Redis hash
 *
 * @async
 * @param {string} email
 * @returns {Promise<UserDocument | null>} returns user or null
 */
export const getUserByEmailCache = async (email: string): Promise<UserDocument | null> => {
  try {
    const userId = await redisClient.GET(`email:${email}`);
    return await getHashCache<UserDocument>(setUserHashKey(userId));
  } catch (e) {
    console.log(e);
    return null;
  }
};
