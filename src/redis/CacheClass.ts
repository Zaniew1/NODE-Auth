import mongoose, { ObjectId } from "mongoose";
import { VerificationCodeDocument } from "../auth/model/verificationCode.model";
import { SessionDocument } from "../session/model/session.model";
import { UserDocument } from "../user/model/user.model";
import redisClient from "./redisClient";
export type FlatObject = Record<string, string>;
export type CacheListType = string | boolean | number | SessionDocument["_id"] | UserDocument["_id"] | VerificationCodeDocument["_id"];
export interface CacheClassType {
  replaceCacheData<T extends object>(key: string, field: keyof T, value: string): Promise<number | null>;
  setHashCache<T extends object>(key: string, attributes: T): Promise<number | null>;
  getHashCache<T extends object>(key: string): Promise<T | null>;
  deleteHashCacheById(key: string): Promise<number | null>;
  serializeCache<T extends object>(attributes: T): FlatObject;
  deserializeCache<T extends object>(flatObject: FlatObject): T;
  setCacheList<T extends object>(key: string, listElement: T): Promise<number | null>;
  getCacheList(key: string): Promise<string[] | null>;
  setStringCache(key: string, value: string): Promise<string | null>;
  getStringCache(key: string): Promise<mongoose.Types.ObjectId | null>;
}

class Cache implements CacheClassType {
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
  public serializeCache = <T extends object>(attributes: T): FlatObject => {
    const serializedObj: FlatObject = {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
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
      try {
        // objects, functions
        const parsedValue = JSON.parse(value);
        deserializedObj[key as keyof T] = parsedValue as T[keyof T];
      } catch {
        // Date
        if (!isNaN(Date.parse(value))) {
          deserializedObj[key as keyof T] = new Date(parseInt(value, 10)) as T[keyof T];
        }
        //number
        else if (!isNaN(Number(value))) {
          deserializedObj[key as keyof T] = Number(value) as T[keyof T];
        }
        //boolean
        else if (value === "true" || value === "false") {
          deserializedObj[key as keyof T] = (value === "true") as T[keyof T];
        }
        //string
        else {
          deserializedObj[key as keyof T] = value as T[keyof T];
        }
      }
    });

    return deserializedObj as T;
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
      return new mongoose.Types.ObjectId(string as string);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
}
export default new Cache();
