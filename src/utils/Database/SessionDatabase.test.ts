import mongoose from "mongoose";
import CacheClass from "../../redis/CacheClass";
import { setSessionHashKey, setSessionListKey } from "../../redis/session";
import SessionModel from "../../session/model/session.model";
import { SessionDocument } from "../../session/model/session.model";
import { UserDocument } from "../../user/model/user.model";
import SessionDb from "./SessionDatabase";
jest.mock("./SessionDatabase", () => ({
  HSET: jest.fn(),
  HGETALL: jest.fn(),
  DEL: jest.fn(),
  LPUSH: jest.fn(),
  LRANGE: jest.fn(),
  SET: jest.fn(),
  GET: jest.fn(),
}));
jest.mock("../../redis/CacheClass.ts", () => {
  return {
    getHashCache: jest.fn(),
    setHashCache: jest.fn(),
    setCacheList: jest.fn(),
    deleteHashCacheById: jest.fn(),
    getCacheList: jest.fn(),
    replaceCacheData: jest.fn(),
  };
});

jest.mock("../../session/model/session.model");
const mockObjectId = new mongoose.Types.ObjectId("123456789123456789123456");
const mockObjectId2 = new mongoose.Types.ObjectId("123456789123456789123456");
const mockSession: Partial<SessionDocument> = {
  _id: mockObjectId,
  userId: mockObjectId2,
  userAgent: "Mozilla/5.0",
  createdAt: new Date(),
  expiresAt: new Date(),
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({
    _id: mockObjectId,
    userId: "user1",
    userAgent: "Mozilla/5.0",
    createdAt: new Date(),
    expiresAt: new Date(),
  }),
};
describe.skip("SessionDatabase class test suite", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe.skip("findById method test suite", () => {
    it("Should return data of type SessionDocument from cache", async () => {});

    it("Should return data of type SessionDocument from database if not in cache", async () => {});
  });

  describe("deleteManyByUserId method test suite", () => {
    it("Should return 0 if there was no data", async () => {});

    it("Should return number of deleted documents if there was some data", async () => {});
  });

  // describe.skip("findSessionsByUserId method test suite", () => {
  //   it("Should return empty array if there was no data", async () => {
  //     CacheClass.getCacheList.mockResolvedValue([]);
  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findSessionsByUserId("user1");
  //     expect(result).toEqual([]);
  //   });

  //   it("Should return data of type SessionDocument", async () => {
  //     const mockSession: SessionDocument = {
  //       _id: "session1",
  //       userId: "user1",
  //       userAgent: "Mozilla/5.0",
  //       createdAt: new Date(),
  //       expiresAt: new Date(),
  //       save: jest.fn(),
  //       toObject: jest.fn().mockReturnValue({
  //         _id: "session1",
  //         userId: "user1",
  //         userAgent: "Mozilla/5.0",
  //         createdAt: new Date(),
  //         expiresAt: new Date(),
  //       }),
  //     };

  //     CacheClass.getCacheList.mockResolvedValue(["session1"]);
  //     CacheClass.getHashCache.mockResolvedValue(mockSession);

  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findSessionsByUserId("user1");
  //     expect(result).toEqual([mockSession]);
  //   });
  // });

  // describe.skip("findByIdAndDelete method test suite", () => {
  //   it("Should return null if there was no data", async () => {
  //     SessionModel.findByIdAndDelete.mockResolvedValue(null);
  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findByIdAndDelete("123");
  //     expect(result).toBeNull();
  //     expect(CacheClass.deleteHashCacheById).toHaveBeenCalledWith(setSessionHashKey("123"));
  //   });

  //   it("Should return data of type SessionDocument when deleted", async () => {
  //     const mockSession: SessionDocument = {
  //       _id: "123",
  //       userId: "user1",
  //       userAgent: "Mozilla/5.0",
  //       createdAt: new Date(),
  //       expiresAt: new Date(),
  //       save: jest.fn(),
  //       toObject: jest.fn().mockReturnValue({
  //         _id: "123",
  //         userId: "user1",
  //         userAgent: "Mozilla/5.0",
  //         createdAt: new Date(),
  //         expiresAt: new Date(),
  //       }),
  //     };

  //     SessionModel.findByIdAndDelete.mockResolvedValue(mockSession);
  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findByIdAndDelete("123");
  //     expect(result).toBe(mockSession);
  //     expect(CacheClass.deleteHashCacheById).toHaveBeenCalledWith(setSessionHashKey("123"));
  //   });
  // });

  // describe.skip("findByIdAndUpdate method test suite", () => {
  //   it("Should return null if there was no data", async () => {
  //     SessionModel.findByIdAndUpdate.mockResolvedValue(null);
  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findByIdAndUpdate("123", { userId: "newUser" });
  //     expect(result).toBeNull();
  //     expect(CacheClass.replaceCacheData).not.toHaveBeenCalled();
  //   });

  //   it("Should return data of type SessionDocument when updated", async () => {
  //     const mockSession: SessionDocument = {
  //       _id: "123",
  //       userId: "user1",
  //       userAgent: "Mozilla/5.0",
  //       createdAt: new Date(),
  //       expiresAt: new Date(),
  //       save: jest.fn(),
  //       toObject: jest.fn().mockReturnValue({
  //         _id: "123",
  //         userId: "newUser",
  //         userAgent: "Mozilla/5.0",
  //         createdAt: new Date(),
  //         expiresAt: new Date(),
  //       }),
  //     };

  //     SessionModel.findByIdAndUpdate.mockResolvedValue(mockSession);
  //     CacheClass.replaceCacheData.mockResolvedValue(true);

  //     const sessionClass = new SessionDb();
  //     const result = await sessionClass.findByIdAndUpdate("123", { userId: "newUser" });
  //     expect(result).toBe(mockSession);
  //     expect(CacheClass.replaceCacheData).toHaveBeenCalled();
  //     expect(SessionModel.findByIdAndUpdate).toHaveBeenCalledWith("123", { userId: "newUser" });
  //   });
  // });
});
