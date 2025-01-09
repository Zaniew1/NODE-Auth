import redisClient from "./redisClient";
import { serializeCache, deserializeCache } from "./serialize";
import { UserDocument } from "../user/model/user.model";
import { SessionDocument } from "../session/model/session.model";
type FlatObject = Record<string, string>;
type sessionIdType = SessionDocument["_id"] | UserDocument["_id"];
export const setCacheSession = async <T extends object>(id: sessionIdType, attributes: T) => {
  const sessionData = serializeCache<T>(attributes);
  try {
    await redisClient.HSET(`session#${id}`, sessionData);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const getCacheSession = async <T extends object>(id: sessionIdType) => {
  try {
    const session: FlatObject = await redisClient.HGETALL(`session#${id}`);
    return deserializeCache<T>(session);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export const deleteCacheSessionById = async (id: sessionIdType) => {
  try {
    await redisClient.DEL(`session#${id}`);
    return id;
  } catch (e) {
    console.log(e);
    return null;
  }
};
