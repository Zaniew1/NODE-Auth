import mongoose from "mongoose";
import { UserDocument } from "../user/model/user.model";
import CacheClass, { CacheProxyClass, Cache } from "./CacheClass";
import redisClient from "./redisClient";

jest.mock("./redisClient", () => ({
  HSET: jest.fn(),
  HGETALL: jest.fn(),
  DEL: jest.fn(),
  LPUSH: jest.fn(),
  LRANGE: jest.fn(),
  SET: jest.fn(),
  GET: jest.fn(),
}));

const ProxyClass = new CacheProxyClass();
const mockObjectId = "123456789123456789123456";
describe("CacheClass test suite", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  describe("replaceCacheData method test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";
      const field = "testField";
      const value = "testValue";

      const result = await CacheClass.replaceCacheData(key, field, value);
      expect(mockHSET).toHaveBeenCalledWith(key, field, value);
      expect(result).toBeNull();
    });
    it("Should return 0 if there was existing data already ", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockResolvedValue(0);

      const key = "testKey";
      const field = "testField";
      const value = "testValue";

      const result = await CacheClass.replaceCacheData(key, field, value);
      expect(mockHSET).toHaveBeenCalledWith(key, field, value);
      expect(result).toBe(0);
    });
    it("Should return 1 if there wasn't any data existing", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockResolvedValue(1);

      const key = "testKey";
      const field = "testField";
      const value = "testValue";

      const result = await CacheClass.replaceCacheData(key, field, value);
      expect(mockHSET).toHaveBeenCalledWith(key, field, value);
      expect(result).toBe(1);
    });
  });
  describe("setHashCache test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";
      const attributes = { name: "test123" };

      const result = await CacheClass.setHashCache<Partial<UserDocument>>(key, attributes);
      expect(mockHSET).toHaveBeenCalledWith(key, attributes);
      expect(result).toBeNull();
    });
    it("Should return 0 if there was existing data already ", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockResolvedValue(0);

      const key = "testKey";
      const attributes = { name: "test123" };
      const result = await CacheClass.setHashCache<Partial<UserDocument>>(key, attributes);
      expect(mockHSET).toHaveBeenCalledWith(key, attributes);
      expect(result).toBe(0);
    });
    it("Should return 1 if there wasn't any data existing", async () => {
      const mockHSET = redisClient.HSET as jest.Mock;
      mockHSET.mockResolvedValue(1);

      const key = "testKey";
      const attributes = { name: "test123" };

      const result = await CacheClass.setHashCache<Partial<UserDocument>>(key, attributes);
      expect(mockHSET).toHaveBeenCalledWith(key, attributes);
      expect(result).toBe(1);
    });
  });
  describe("getHashCache test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockHGETALL = redisClient.HGETALL as jest.Mock;
      mockHGETALL.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";
      const attributes = { name: "test123" };

      const result = await CacheClass.getHashCache<Partial<UserDocument>>(key);
      expect(mockHGETALL).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
    it("Should return empty object if there are no data ", async () => {
      const mockHGETALL = redisClient.HGETALL as jest.Mock;
      mockHGETALL.mockResolvedValue({});

      const key = "testKey";

      const result = await CacheClass.getHashCache<Partial<UserDocument>>(key);
      expect(mockHGETALL).toHaveBeenCalledWith(key);
      expect(result).toMatchObject({});
    });
    it("Should return object with data if there are data ", async () => {
      const mockHGETALL = redisClient.HGETALL as jest.Mock;
      mockHGETALL.mockResolvedValue({ name: "test1" });

      const key = "testKey";

      const result = await CacheClass.getHashCache<Partial<UserDocument>>(key);
      expect(mockHGETALL).toHaveBeenCalledWith(key);
      expect(result).toMatchObject({ name: "test1" });
    });
  });
  describe("deleteHashCacheById test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockDEL = redisClient.DEL as jest.Mock;
      mockDEL.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";

      const result = await CacheClass.deleteHashCacheById(key);
      expect(mockDEL).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
    it("Should return numeric value if something was deleted", async () => {
      const mockDEL = redisClient.DEL as jest.Mock;
      mockDEL.mockResolvedValue(2);

      const key = "testKey";

      const result = await CacheClass.deleteHashCacheById(key);
      expect(mockDEL).toHaveBeenCalledWith(key);
      expect(result).toBe(2);
    });
  });
  describe("setCacheList test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockLPUSH = redisClient.LPUSH as jest.Mock;
      mockLPUSH.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";
      const listElement = new mongoose.Types.ObjectId(mockObjectId as string);

      const result = await CacheClass.setCacheList<UserDocument["_id"]>(key, listElement);
      expect(mockLPUSH).toHaveBeenCalledWith(key, String(listElement));
      expect(result).toBeNull();
    });
    it("Should return number of element in a list", async () => {
      const mockLPUSH = redisClient.LPUSH as jest.Mock;
      mockLPUSH.mockResolvedValue(2);

      const key = "testKey";
      const listElement = new mongoose.Types.ObjectId(mockObjectId as string);
      const result = await CacheClass.setCacheList<UserDocument["_id"]>(key, listElement);

      expect(mockLPUSH).toHaveBeenCalledWith(key, String(listElement));
      expect(result).toBe(2);
    });
  });
  describe("getCacheList test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockLRANGE = redisClient.LRANGE as jest.Mock;
      mockLRANGE.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";

      const result = await CacheClass.getCacheList(key);
      expect(mockLRANGE).toHaveBeenCalledWith(key, 0, -1);
      expect(result).toBeNull();
    });
    it("Should return array of elements if there were elements in redis", async () => {
      const mockLRANGE = redisClient.LRANGE as jest.Mock;
      mockLRANGE.mockResolvedValue([1, 2]);

      const key = "testKey";
      const result = await CacheClass.getCacheList(key);

      expect(mockLRANGE).toHaveBeenCalledWith(key, 0, -1);
      expect(result).toEqual([1, 2]);
    });
    it("Should return empty array if there were no elements in redis", async () => {
      const mockLRANGE = redisClient.LRANGE as jest.Mock;
      mockLRANGE.mockResolvedValue([]);

      const key = "testKey";
      const result = await CacheClass.getCacheList(key);

      expect(mockLRANGE).toHaveBeenCalledWith(key, 0, -1);
      expect(result).toEqual([]);
    });
  });
  describe("setStringCache test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockSET = redisClient.SET as jest.Mock;
      mockSET.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";
      const value = "test123";

      const result = await CacheClass.setStringCache(key, value);
      expect(mockSET).toHaveBeenCalledWith(key, value);
      expect(result).toBeNull();
    });
    it("Should return 'OK', if data were proper", async () => {
      const mockSET = redisClient.SET as jest.Mock;
      mockSET.mockResolvedValue("OK");

      const key = "testKey";
      const value = "test123";

      const result = await CacheClass.setStringCache(key, value);
      expect(mockSET).toHaveBeenCalledWith(key, value);
      expect(result).toBe("OK");
    });
  });
  describe("getStringCache test suite", () => {
    it("Should return null if there was an error in Redis", async () => {
      const mockGET = redisClient.GET as jest.Mock;
      mockGET.mockRejectedValue(new Error("Redis error"));

      const key = "testKey";

      const result = await CacheClass.getStringCache(key);
      expect(mockGET).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
    it("Should return null if there was no data in Redis", async () => {
      const mockGET = redisClient.GET as jest.Mock;
      mockGET.mockResolvedValue(null);

      const key = "testKey";

      const result = await CacheClass.getStringCache(key);
      expect(mockGET).toHaveBeenCalledWith(key);
      expect(result).toBe(null);
    });
    it("Should return string if there was  data in Redis", async () => {
      const mockGET = redisClient.GET as jest.Mock;
      mockGET.mockResolvedValueOnce(mockObjectId);

      const key = "testKey";

      const result = await CacheClass.getStringCache(key);
      expect(mockGET).toHaveBeenCalledWith(key);
      const objectId = new mongoose.Types.ObjectId(mockObjectId);
      expect(result).toEqual(objectId);
    });
  });
  describe("serializeCache test suite", () => {
    it("Should return serialized object", async () => {
      const attributes = {
        _id: new mongoose.Types.ObjectId(mockObjectId),
        name: "123",
        createdAt: new Date(0),
        verified: true,
        comparePassword: jest.fn(),
      };
      const result = await CacheClass.serializeCache<Partial<UserDocument>>(attributes);
      expect(result).toEqual({
        _id: mockObjectId,
        name: "123",
        createdAt: "0",
        verified: "true",
        comparePassword: JSON.stringify(jest.fn()),
      });
    });
    it("Should return empty object if attributes were empty", async () => {
      const attributes = {};

      const result = await CacheClass.serializeCache<Partial<UserDocument>>(attributes);
      expect(result).toEqual({});
    });
  });
  describe("deserializeCache test suite", () => {
    it("Should return deserialized object", async () => {
      const attributes = {
        _id: mockObjectId,
        name: "Test1",
        password: "123",
        createdAt: "0",
        verified: "true",
      };

      const result = await CacheClass.deserializeCache<Partial<UserDocument>>(attributes);
      expect(result).toEqual({
        _id: new mongoose.Types.ObjectId(mockObjectId),
        name: "Test1",
        password: 123,
        createdAt: new Date(0),
        verified: true,
      });
    });
    it("Should return empty object if attributes are empty", async () => {
      const attributes = {};
      const result = await CacheClass.deserializeCache<Partial<UserDocument>>(attributes);
      expect(result).toEqual({});
    });
  });
});

describe("CacheProxyClass test suite", () => {
  beforeAll(() => {
    process.env.REDIS_ON = "false";
  });
  afterAll(() => {
    process.env.REDIS_ON = "true";
  });
  it("Should return null from replaceCacheData", async () => {
    const result = await ProxyClass.replaceCacheData<Partial<UserDocument>>("", "name", "123");
    expect(result).toBeNull();
  });
  it("Should return null from setHashCache", async () => {
    const result = await ProxyClass.setHashCache<Partial<UserDocument>>("", { name: "123" });
    expect(result).toBeNull();
  });
  it("Should return null from getHashCache", async () => {
    const result = await ProxyClass.getHashCache<Partial<UserDocument>>("");
    expect(result).toBeNull();
  });
  it("Should return null from deleteHashCacheById", async () => {
    const result = await ProxyClass.deleteHashCacheById("");
    expect(result).toBeNull();
  });
  it("Should return null from setCacheList", async () => {
    const result = await ProxyClass.setCacheList<UserDocument["_id"]>("", new mongoose.Types.ObjectId(mockObjectId));
    expect(result).toBeNull();
  });
  it("Should return null from getCacheList", async () => {
    const result = await ProxyClass.getCacheList("");
    expect(result).toBeNull();
  });
  it("Should return null from setStringCache", async () => {
    const result = await ProxyClass.setStringCache("", "name");
    expect(result).toBeNull();
  });
  it("Should return null from getStringCache", async () => {
    const result = await ProxyClass.getStringCache("");
    expect(result).toBeNull();
  });
  it("Should return null from serializeCache", async () => {
    const result = await ProxyClass.serializeCache<Partial<UserDocument>>({ name: "123" });
    expect(result).toEqual({});
  });
  it("Should return null from deserializeCache", async () => {
    process.env.REDIS_ON = "false";

    const result = await ProxyClass.deserializeCache<Partial<UserDocument>>({ name: "123" });
    expect(result).toEqual({});
  });
});
