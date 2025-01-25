import mongoose from "mongoose";
import { CacheClassType } from "./CacheClass";
import { FlatObject } from "./CacheClass";
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
