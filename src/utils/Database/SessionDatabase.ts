import CacheClass from "../../redis/CacheClass";
import { setSessionHashKey, setSessionListKey } from "../../redis/session";
import { SessionDocument } from "../../session/model/session.model";
import SessionModel from "../../session/model/session.model";
import { DeleteResult } from "mongoose";
export interface SessionClassType {
  create(properties: object): Promise<SessionDocument>;
  findById(properties: object): Promise<SessionDocument | null>;
  deleteManyByUserId(userId: SessionDocument["_id"]): Promise<DeleteResult | null>;
  find(properties: object): Promise<SessionDocument[] | null>;
  findOneAndDelete(properties: object): Promise<SessionDocument | null>;
}

class SessionClass implements SessionClassType {
  async create(properties: object): Promise<SessionDocument> {
    const session = await SessionModel.create(properties);
    await CacheClass.setHashCache<SessionDocument>(setSessionHashKey(session._id), session.toObject());
    await CacheClass.setCacheList(setSessionListKey(session.userId), session._id);
    return session;
  }
  async findById(id: SessionDocument["_id"]): Promise<SessionDocument | null> {
    const session = CacheClass.getHashCache<SessionDocument>(setSessionHashKey(id));
    if (!session) {
      return await SessionModel.findById(id);
    }
    return session;
  }
  async deleteManyByUserId(userId: SessionDocument["_id"]): Promise<DeleteResult | null> {
    const sessionsId = await CacheClass.getCacheList(setSessionListKey(userId));
    if (sessionsId) {
      sessionsId.forEach(async (session) => {
        await CacheClass.deleteHashCacheById(setSessionHashKey(session));
      });
    }
    return await SessionModel.deleteMany({ userId });
  }
  async find(properties: object): Promise<SessionDocument[] | null> {
    return await SessionModel.find(properties);
  }
  async findOneAndDelete(properties: object): Promise<SessionDocument | null> {
    return await SessionModel.findOneAndDelete(properties);
  }
}
export default new SessionClass();
