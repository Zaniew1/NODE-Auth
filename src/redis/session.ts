import redisClient from "./redisClient";
import { serializeCache, deserializeCache } from "./serialize";
import { deleteHashCacheById } from "./methods";
import { SessionDocument } from "../session/model/session.model";
import { UserDocument } from "../user/model/user.model";
export const setSessionHashKey = (id: SessionDocument["_id"]) => {
  return `session#${id}`;
};

export const setUserSessionsCache = async (id: UserDocument["_id"], session: SessionDocument["_id"]) => {
  await redisClient.sAdd(`userSessions:${id}`, String(id));
  return;
};
export const deleteUserSessionsCache = async (id: UserDocument["_id"]) => {
  const sessionsId = await redisClient.SMEMBERS(`userSessions:${id}`);
  sessionsId.forEach(async (session) => {
    await deleteHashCacheById(setSessionHashKey(session));
  });
  return;
};
