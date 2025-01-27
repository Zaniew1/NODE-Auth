import mongoose from 'mongoose';
import redisClient from './redisClient';
import { CacheClassType } from './CacheClass';
import { FlatObject } from './CacheClass';

/**
 * This class implements Redis. It contains general and reusable methods for many Redis structures like Hashes, Sets, Strings, Lists
 *
 * @export
 * @class Cache
 * @typedef {Cache}
 * @implements {CacheClassType}
 */
export class Cache implements CacheClassType {
  /**
   * Creates an instance of Cache.
   *
   * @constructor
   */
  constructor() {}
  /**
   * This function replaces data that are in Hash, key is a unique string for a Hash like 'session#123123123'.
   * Field is a key of a generic that has to be passed to a method.
   * Value is a value that will be replaced.
   *
   * @async
   * @template {object} T
   * @param {string} key
   * @param {keyof T} field
   * @param {string} value
   * @returns {Promise<number | null>}
   */
  public replaceHashCacheData = async <T extends object>(key: string, field: keyof T, value: string): Promise<number | null> => {
    try {
      return await redisClient.HSET(key, field as string, value as string);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  /**
   * This method creates a Hash in Redis. It can also update a hash.
   * As method parameter (key) you need to use for ex. setSessionHashKey(). This will create string like 'session#12315123123'
   *
   *
   * @async
   * @template {object} T
   * @param {string} key
   * @param {T} attributes
   * @returns {Promise<number | null>}
   */
  public setHashCache = async <T extends object>(key: string, attributes: T): Promise<number | null> => {
    const data = this.serializeCache<T>(attributes);
    try {
      return await redisClient.HSET(key, data);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  /**
   * This method retrieves data from hash from Redis.
   * As method parameter (key) you need to use for ex. setSessionHashKey(). This will create string like 'session#12315123123'
   *
   * @async
   * @template {object} T
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  public getHashCache = async <T extends object>(key: string): Promise<T | null> => {
    try {
      const data: FlatObject = await redisClient.HGETALL(key);
      return this.deserializeCache<T>(data);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  /**
   * This method deletes hash by its key (not id).
   * As method parameter (key) you need to use for ex. setSessionHashKey(). This will create string like 'session#12315123123'
   *
   * @async
   * @param {string} key
   * @returns {Promise<number | null>}
   */
  public deleteHashCacheById = async (key: string): Promise<number | null> => {
    try {
      return await redisClient.DEL(key);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  /**
   * This method adds element to a list by key (not id).
   * As method parameter (key) you need to use for ex. setSessionListKey(). This will create string like 'user:sessions:12315123123'
   *
   * @async
   * @template T
   * @param {string} key
   * @param {T} listElement
   * @returns {Promise<number | null>}
   */
  public setCacheList = async <T>(key: string, listElement: T): Promise<number | null> => {
    try {
      return await redisClient.LPUSH(key, String(listElement));
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  /**
   *  This method retrieves all elements in a list by key (not id).
   * As method parameter (key) you need to use for ex. setSessionListKey(). This will create string like 'user:sessions:12315123123'
   *
   *
   * @async
   * @param {string} key
   * @returns {Promise<string[] | null>}
   */
  public getCacheList = async (key: string): Promise<string[] | null> => {
    try {
      return await redisClient.LRANGE(key, 0, -1);
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  /**
   * This method sets a string in Redis.
   *
   * @async
   * @param {string} key
   * @param {string} value
   * @returns {Promise<string | null>}
   */
  public setStringCache = async (key: string, value: string): Promise<string | null> => {
    try {
      return await redisClient.SET(key, String(value));
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  /**
   * This method retrieves a string from Redis.
   *
   * @async
   * @param {string} key
   * @returns {Promise<mongoose.Types.ObjectId | null>}
   */
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
  /**
   * This method serialize all data to a string, but differently based on its type (it uses generic).
   * For primitive types it just converts to a string,
   * for Date type it converts Date to a unix timestamp
   * for objects and functions it stringifies it to a JSON.
   * Method always returns Flat object
   *
   * @template {object} T
   * @param {T} attributes
   * @returns {FlatObject}
   */
  public serializeCache = <T extends object>(attributes: T): FlatObject => {
    const serializedObj: FlatObject = {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || mongoose.isValidObjectId(value)) {
        serializedObj[key] = String(value);
      } else if (value instanceof Date) {
        serializedObj[key] = String(value.getTime());
      } else if ((typeof value === 'object' || typeof value === 'function') && value !== null) {
        serializedObj[key] = JSON.stringify(value); // Serialize nested objects as JSON strings
      } else {
        serializedObj[key] = String(value);
      }
    });
    return serializedObj;
  };
  /**
   * This method deserialize all data from a string, but differently based on its type (it uses generic).
   * @template {object} T
   * @param {FlatObject} flatObject
   * @returns {T}
   */
  public deserializeCache = <T extends object>(flatObject: FlatObject): T => {
    const deserializedObj: Partial<T> = {};
    Object.entries(flatObject).forEach(([key, value]) => {
      if ((key === '_id' || key === 'userId') && mongoose.isValidObjectId(value)) {
        deserializedObj[key as keyof T] = new mongoose.Types.ObjectId(value) as T[keyof T];
      } else if (key === 'expiresAt' || key === 'createdAt' || key === 'updatedAt') {
        deserializedObj[key as keyof T] = new Date(Number(value)) as T[keyof T];
      } else if (key === 'name' || key === 'surname' || key === 'type' || key === 'email' || key === 'userAgent') {
        deserializedObj[key as keyof T] = String(value) as T[keyof T];
      } else if (value === 'true' || value === 'false') {
        deserializedObj[key as keyof T] = (value === 'true') as T[keyof T];
      } else if (!isNaN(Number(value))) {
        deserializedObj[key as keyof T] = Number(value) as T[keyof T];
      } else {
        deserializedObj[key as keyof T] = value as T[keyof T];
      }
    });
    return deserializedObj as T;
  };
}
