import mongoose from "mongoose";
import redisClient from "./redisClient";
import { REDIS_ON } from "../utils/constants/env";
export type FlatObject = Record<string, string>;
export interface CacheClassType {
  replaceCacheData<T extends object>(key: string, field: keyof T, value: string): Promise<number | null>;
  setHashCache<T extends object>(key: string, attributes: T): Promise<number | null>;
  getHashCache<T extends object>(key: string): Promise<T | null>;
  deleteHashCacheById(key: string): Promise<number | null>;
  setCacheList<T extends object>(key: string, listElement: T): Promise<number | null>;
  getCacheList(key: string): Promise<string[] | null>;
  setStringCache(key: string, value: string): Promise<string | null>;
  getStringCache(key: string): Promise<mongoose.Types.ObjectId | null>;
  serializeCache<T extends object>(attributes: T): FlatObject;
  deserializeCache<T extends object>(flatObject: FlatObject): T;
}

export class Cache implements CacheClassType {
  constructor() {}
  public replaceCacheData = async <T extends object>(key: string, field: keyof T, value: string): Promise<number | null> => {
    try {
      return await redisClient.HSET(key, field as string, value as string);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  public setHashCache = async <T extends object>(key: string, attributes: T): Promise<number | null> => {
    const data = this.serializeCache<T>(attributes);
    try {
      return await redisClient.HSET(key, data);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  public getHashCache = async <T extends object>(key: string): Promise<T | null> => {
    try {
      const data: FlatObject = await redisClient.HGETALL(key);
      return this.deserializeCache<T>(data);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  public deleteHashCacheById = async (key: string): Promise<number | null> => {
    try {
      return await redisClient.DEL(key);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  public setCacheList = async <T>(key: string, listElement: T): Promise<number | null> => {
    try {
      return await redisClient.LPUSH(key, String(listElement));
    } catch (e) {
      return null;
    }
  };
  public getCacheList = async (key: string): Promise<string[] | null> => {
    try {
      return await redisClient.LRANGE(key, 0, -1);
    } catch (e) {
      return null;
    }
  };
  public setStringCache = async (key: string, value: string): Promise<string | null> => {
    try {
      return await redisClient.SET(key, String(value));
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  public getStringCache = async (key: string): Promise<mongoose.Types.ObjectId | null> => {
    try {
      const string = await redisClient.GET(key);
      if (string != null) {
        return new mongoose.Types.ObjectId(string as string);
      }
      return string;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  public serializeCache = <T extends object>(attributes: T): FlatObject => {
    const serializedObj: FlatObject = {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || mongoose.isValidObjectId(value)) {
        serializedObj[key] = String(value);
      } else if (value instanceof Date) {
        serializedObj[key] = String(value.getTime());
      } else if ((typeof value === "object" || typeof value === "function") && value !== null) {
        serializedObj[key] = JSON.stringify(value); // Serialize nested objects as JSON strings
      }
    });
    return serializedObj;
  };
  public deserializeCache = <T extends object>(flatObject: FlatObject): T => {
    const deserializedObj: Partial<T> = {};
    Object.entries(flatObject).forEach(([key, value]) => {
      // console.log(key);
      if ((key === "_id" || key === "userId") && mongoose.isValidObjectId(value)) {
        deserializedObj[key as keyof T] = new mongoose.Types.ObjectId(value) as T[keyof T];
      } else if (key === "expiresAt" || key === "createdAt" || key === "updatedAt") {
        deserializedObj[key as keyof T] = new Date(Number(value)) as T[keyof T];
      } else if (key === "name" || key === "surname" || key === "type" || key === "email" || key === "userAgent") {
        deserializedObj[key as keyof T] = String(value) as T[keyof T];
      } else if (value === "true" || value === "false") {
        deserializedObj[key as keyof T] = (value === "true") as T[keyof T];
      } else if (!isNaN(Number(value))) {
        deserializedObj[key as keyof T] = Number(value) as T[keyof T];
      } else {
        deserializedObj[key as keyof T] = value as T[keyof T];
      }
    });
    return deserializedObj as T;
  };
}
export class CacheProxyClass implements CacheClassType {
  constructor() {}
  public replaceCacheData = async <T extends object>(key: string, field: keyof T, value: string): Promise<number | null> => {
    return null;
  };
  public setHashCache = async <T extends object>(key: string, attributes: T): Promise<number | null> => {
    return null;
  };
  public getHashCache = async <T extends object>(key: string): Promise<T | null> => {
    return null;
  };
  public deleteHashCacheById = async (key: string): Promise<number | null> => {
    return null;
  };
  public setCacheList = async <T>(key: string, listElement: T): Promise<number | null> => {
    return null;
  };
  public getCacheList = async (key: string): Promise<string[] | null> => {
    return null;
  };
  public setStringCache = async (key: string, value: string): Promise<string | null> => {
    return null;
  };
  public getStringCache = async (key: string): Promise<mongoose.Types.ObjectId | null> => {
    return null;
  };
  public serializeCache = <T extends object>(attributes: T): FlatObject => {
    return {};
  };
  public deserializeCache = <T extends object>(flatObject: FlatObject): T => {
    const deserializedObj: Partial<T> = {};
    return deserializedObj as T;
  };
}

const cache = REDIS_ON == "true" ? new Cache() : new CacheProxyClass();
export default cache;
