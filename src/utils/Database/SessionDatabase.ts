import CacheClass from "../../redis/CacheClass";
import { setSessionHashKey, setSessionListKey } from "../../redis/session";
import { SessionDocument } from "../../session/model/session.model";
import SessionModel from "../../session/model/session.model";
import mongoose from "mongoose";
import { UserDocument } from "../../user/model/user.model";
export interface SessionClassType {
  create(properties: Partial<SessionDocument>): Promise<SessionDocument>;
  findById(id: SessionDocument["_id"]): Promise<SessionDocument | null>;
  deleteManyByUserId(userId: SessionDocument["_id"]): Promise<number | null>;
  findSessionsByUserId(id: UserDocument["_id"]): Promise<SessionDocument[]>;
  findByIdAndDelete(id: SessionDocument["_id"]): Promise<SessionDocument | null>;
  findByIdAndUpdate(id: SessionDocument["_id"], properties: Partial<SessionDocument>): Promise<SessionDocument | null>;
}

export default class SessionClass implements SessionClassType {
  async create(properties: Partial<SessionDocument>): Promise<SessionDocument> {
    const session = await SessionModel.create(properties);
    await CacheClass.setHashCache<SessionDocument>(setSessionHashKey(session._id), session.toObject());
    await CacheClass.setCacheList<SessionDocument["_id"]>(setSessionListKey(session.userId), session._id);
    return session;
  }
  async findById(id: SessionDocument["_id"]): Promise<SessionDocument | null> {
    const sessionCache = await CacheClass.getHashCache<SessionDocument>(setSessionHashKey(id));
    if (!sessionCache) {
      const session = await SessionModel.findById(id);
      if (session) await CacheClass.setHashCache<SessionDocument>(setSessionHashKey(id), session.toObject());
      return session;
    }
    return sessionCache;
  }
  async deleteManyByUserId(userId: UserDocument["_id"]): Promise<number | null> {
    const sessionsId = await CacheClass.getCacheList(setSessionListKey(userId));
    if (sessionsId) {
      sessionsId.forEach(async (session) => {
        const sessionObjectId = new mongoose.Types.ObjectId(session);
        await CacheClass.deleteHashCacheById(setSessionHashKey(sessionObjectId));
      });
    }
    return (await SessionModel.deleteMany({ userId })).deletedCount;
  }
  async findSessionsByUserId(id: UserDocument["_id"]): Promise<SessionDocument[]> {
    let sessions: SessionDocument[] = [];
    const sessionsIdByUserId = await CacheClass.getCacheList(setSessionListKey(id));
    sessionsIdByUserId?.forEach(async (sessionId) => {
      const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
      const session = await CacheClass.getHashCache<SessionDocument>(setSessionHashKey(sessionObjectId));

      if (session?.createdAt && session.createdAt instanceof Date && session.createdAt > new Date()) {
        sessions.push(session as SessionDocument);
      }
    });
    if (sessions.length === 0) {
      sessions = await SessionModel.find({
        userId: id,
        expiresAt: { $gt: new Date() },
      });
    }
    return sessions.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return dateA - dateB;
    });
  }
  async findByIdAndDelete(id: SessionDocument["_id"]): Promise<SessionDocument | null> {
    await CacheClass.deleteHashCacheById(setSessionHashKey(id));
    return await SessionModel.findByIdAndDelete(String(id));
  }
  async findByIdAndUpdate(id: SessionDocument["_id"], properties: Partial<SessionDocument>): Promise<SessionDocument | null> {
    Object.entries(CacheClass.serializeCache<Partial<SessionDocument>>(properties)).forEach(async ([key, value]) => {
      const typedKey = key as keyof SessionDocument;
      await CacheClass.replaceCacheData<SessionDocument>(setSessionHashKey(id), typedKey, String(value as SessionDocument[typeof typedKey]));
    });
    return await SessionModel.findByIdAndUpdate(id, properties);
  }
}
