import mongoose from "mongoose";
import CacheClass from "../../redis/CacheClass";
import { setSessionHashKey, setSessionListKey } from "../../redis/session";
import SessionModel, { SessionDocument } from "../../session/model/session.model";
import SessionDatabase from "./SessionDatabase";
import { UserDocument } from "../../user/model/user.model";

const SessionDb = new SessionDatabase();
const mockUserId = new mongoose.Types.ObjectId("123456789123456789123456") as UserDocument["_id"];
const mockSessionId = new mongoose.Types.ObjectId("123456789123456789123456") as SessionDocument["_id"];
const now = new Date(Date.now() + 10000);
const mockSessionData = {
  _id: mockSessionId,
  userId: mockUserId,
  userAgent: "test",
  expiresAt: now,
  toObject: jest.fn(() => ({
    _id: mockUserId,
    userId: mockUserId,
    userAgent: "test",
    expiresAt: now,
  })),
} as unknown as Partial<SessionDocument> as SessionDocument;
describe("userDatabase test suite", () => {
  describe("create method test suite", () => {
    it("should create session", async () => {
      jest.spyOn(SessionModel, "create").mockResolvedValue(mockSessionData as any);
      const result = await SessionDb.create(mockSessionData);
      expect(result.toObject()).toEqual(mockSessionData.toObject());
    });
  });
  describe("findById method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(null);
      jest.spyOn(SessionModel, "findById").mockResolvedValue(null);
      const result = await SessionDb.findById(mockSessionId);
      expect(result).toBeNull();
    });
    it("should return session  if there was data in cache", async () => {
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(mockSessionData);
      const result = await SessionDb.findById(mockSessionId);
      expect(result).toEqual(mockSessionData);
    });
    it("should return session if there was data in db", async () => {
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(null);
      jest.spyOn(SessionModel, "findById").mockResolvedValue(mockSessionData);
      const result = await SessionDb.findById(mockSessionId);
      expect(result).toEqual(mockSessionData);
    });
  });
  describe("deleteManyByUserId method test suite", () => {
    it("should return 0 if no data was found", async () => {
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue(null);
      jest.spyOn(SessionModel, "deleteMany").mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      });
      jest.spyOn(CacheClass, "deleteHashCacheById").mockResolvedValue(null);
      const result = await SessionDb.deleteManyByUserId(mockUserId);
      expect(result).toBe(0);
    });
    it("should return number of sessions if data were deleted", async () => {
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue([String(mockUserId)]);
      jest.spyOn(CacheClass, "deleteHashCacheById").mockResolvedValue(1);
      jest.spyOn(SessionModel, "deleteMany").mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });
      const result = await SessionDb.deleteManyByUserId(mockUserId);
      expect(result).toBe(1);
    });
  });
  describe("findSessionsByUserId method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue(null);
      jest.spyOn(SessionModel, "find").mockResolvedValue([]);
      const result = await SessionDb.findSessionsByUserId(mockUserId);
      expect(result).toEqual([]);
    });
    it("should return sessions if data was in Cache", async () => {
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue([String(mockSessionId)]);
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(mockSessionData);
      const result = await SessionDb.findSessionsByUserId(mockUserId);
      expect(result).toEqual([mockSessionData]);
    });
    it("should return sessions if data was in Db", async () => {
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue(null);
      jest.spyOn(SessionModel, "find").mockResolvedValue([mockSessionData]);
      const result = await SessionDb.findSessionsByUserId(mockUserId);
      expect(result).toEqual([mockSessionData]);
    });
  });
  describe("findByIdAndDelete method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(SessionModel, "findByIdAndDelete").mockResolvedValue(null);
      jest.spyOn(CacheClass, "deleteHashCacheById").mockResolvedValue(null);
      const result = await SessionDb.findByIdAndDelete(mockSessionId);
      expect(result).toBeNull();
    });
    it("should return session if there was data", async () => {
      jest.spyOn(SessionModel, "findByIdAndDelete").mockResolvedValue(mockSessionData);
      jest.spyOn(CacheClass, "deleteHashCacheById").mockResolvedValue(null);
      const result = await SessionDb.findByIdAndDelete(mockSessionId);
      expect(result).toEqual(mockSessionData);
    });
  });
  describe("findByIdAndUpdate method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(CacheClass, "replaceCacheData").mockResolvedValue(null);
      jest.spyOn(SessionModel, "findOneAndUpdate").mockResolvedValue(null);
      const result = await SessionDb.findByIdAndUpdate(mockSessionId, { userAgent: "test2" });
      expect(result).toBeNull();
    });
    it("should return session if data was found", async () => {
      const newSessionData = mockSessionData;
      newSessionData.userAgent = "test2";
      jest.spyOn(CacheClass, "replaceCacheData").mockResolvedValue(null);
      jest.spyOn(SessionModel, "findOneAndUpdate").mockResolvedValue(newSessionData);
      const result = await SessionDb.findByIdAndUpdate(mockSessionId, { userAgent: "test2" });
      expect(result).toEqual(newSessionData);
    });
  });
});
