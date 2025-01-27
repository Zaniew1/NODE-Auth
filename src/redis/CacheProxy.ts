import mongoose from 'mongoose';
import { CacheClassType } from './CacheClass';
import { FlatObject } from './CacheClass';

/**
 * This is a mock class. It runs when user does not want to use Redis (REDIS_ON == "false").
 *
 * @export
 * @class CacheProxyClass
 * @typedef {CacheProxyClass}
 * @implements {CacheClassType}
 */

export class CacheProxyClass implements CacheClassType {
  constructor() {}
  public replaceHashCacheData = async <T extends object>(_key: string, _field: keyof T, _value: string): Promise<number | null> => {
    return null;
  };
  public setHashCache = async <T extends object>(_key: string, _attributes: T): Promise<number | null> => {
    return null;
  };
  public getHashCache = async <T extends object>(_key: string): Promise<T | null> => {
    return null;
  };
  public deleteHashCacheById = async (_key: string): Promise<number | null> => {
    return null;
  };
  public setCacheList = async <T>(_key: string, _listElement: T): Promise<number | null> => {
    return null;
  };
  public getCacheList = async (_key: string): Promise<string[] | null> => {
    return null;
  };
  public setStringCache = async (_key: string, _value: string): Promise<string | null> => {
    return null;
  };
  public getStringCache = async (_key: string): Promise<mongoose.Types.ObjectId | null> => {
    return null;
  };
  public serializeCache = <T extends object>(_attributes: T): FlatObject => {
    return {};
  };
  public deserializeCache = <T extends object>(_flatObject: FlatObject): T => {
    const deserializedObj: Partial<T> = {};
    return deserializedObj as T;
  };
}
