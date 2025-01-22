import mongoose from "mongoose";
import CacheClass from "../../redis/CacheClass";
import { setSessionHashKey, setSessionListKey } from "../../redis/session";
import SessionModel, { SessionDocument } from "../../session/model/session.model";
import * as SessionFunc from "../../redis/session";
import { UserDocument } from "../../user/model/user.model";
jest.mock("../../session/model/session.model", () => ({
  create: jest.fn(),
}));

jest.mock("../../redis/session", () => ({
  setSessionHashKey: jest.fn(),
  setSessionListKey: jest.fn(),
}));

jest.mock("../../redis/CacheClass", () => {
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
const mockId = new mongoose.Types.ObjectId("123456789123456789123456");
const mockUserId = new mongoose.Types.ObjectId("123456789123456789123455");

describe("SessionDatabase class test suite", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe.skip("findById method test suite", () => {
    it("Should return data of type SessionDocument from cache if REDIS_ON == true", async () => {});

    it("Should return data of type SessionDocument from database if not in cache", async () => {});
  });
  describe.skip("create method test suite", () => {
    it("Should create session", async () => {
      const properties = { userId: "123", data: "test data" };
      const mockSession: SessionDocument = {
        _id: mockId.toHexString(),
        userId: mockUserId.toHexString(),
        createdAt: new Date(0),
        expiresAt: new Date(0),
        toObject: jest.fn().mockReturnValue({
          _id: mockId,
          userId: mockUserId,
          createdAt: new Date(0),
          expiresAt: new Date(0),
        }),
      } as unknown as SessionDocument;
      // Mock SessionModel.create
      (SessionModel.create as jest.Mock).mockResolvedValueOnce(mockSession);

      // Mock cache key helper functions
      jest.spyOn(SessionFunc, "setSessionHashKey").mockReturnValue("session#123");
      jest.spyOn(SessionFunc, "setSessionListKey").mockReturnValue("user:sessions:123");

      // Call the function
      const result = await SessionModel.create(properties);

      // Assertions
      expect(SessionModel.create).toHaveBeenCalledWith(properties);
      // expect(setSessionHashKey).toHaveBeenCalledWith(mockId);
      // expect(setSessionListKey).toHaveBeenCalledWith(mockUserId);
      expect(CacheClass.setHashCache).toHaveBeenCalledWith("session#123", mockSession.toObject());
      expect(CacheClass.setCacheList).toHaveBeenCalledWith("user:sessions:123", mockSession._id);
      expect(result).toBe(mockSession);
    });

    it.skip("Should return data of type SessionDocument from database if not in cache", async () => {});
  });
  describe.skip("deleteManyByUserId method test suite", () => {
    it("Should return 0 if there was no data", async () => {});

    it("Should return number of deleted documents if there was some data", async () => {});
  });
});
