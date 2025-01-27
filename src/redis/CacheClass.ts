import mongoose from 'mongoose';
import { REDIS_ON } from '../utils/constants/env';
import { CacheProxyClass } from './CacheProxy';
import { Cache } from './Cache';
export type FlatObject = Record<string, string>;
/**
 * This file exports the appropriate class depending on whether you want to use redis or not.
 * When we don't want to use redis a Proxy class is created which always returns null or empty object from methods.
 * On the other hand, when we want to use redis then the Cache() class is created, it contains all the methods needed to handle the cache.
 * Both classes have to implement CacheClassType interface
 * @export
 * @class CacheProxyClass
 * @typedef {CacheProxyClass}
 * @implements {CacheClassType}
 */
export interface CacheClassType {
  replaceHashCacheData<T extends object>(key: string, field: keyof T, value: string): Promise<number | null>;
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

const cache = REDIS_ON == 'true' ? new Cache() : new CacheProxyClass();
export default cache;
