import redisClient from "./redisClient";
import { serializeCache, deserializeCache } from "./serialize";
import { UserDocument } from "../user/model/user.model";
import { SessionDocument } from "../session/model/session.model";
import { VerificationCodeDocument } from "../auth/model/verificationCode.model";
type FlatObject = Record<string, string>;

export const setUserHashKey = (id: UserDocument["_id"]) => {
  return `user#${id}`;
};
export const setSessionHashKey = (id: SessionDocument["_id"]) => {
  return `session#${id}`;
};
export const setVerificationCodeHashKey = (id: VerificationCodeDocument["_id"]) => {
  return `verificationCode#${id}`;
};
// skrypty do napisania:
// znajdź usera po mailu
// usuń wszystkie sesje po Userid
// znajdz kod werifikacyjny z konkretnym userId, typem: "password_reset", stworzony 5 min temu

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
