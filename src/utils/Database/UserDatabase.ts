import { UserDocument } from "../../user/model/user.model";
import UserModel from "../../user/model/user.model";
import CacheClass from "../../redis/CacheClass";
import { setUniqueEmailStringKey, setUserHashKey } from "../../redis/user";
// import mongoose, { ObjectId } from "mongoose";
export interface UserClassType {
  existsByEmail(email: string): Promise<UserDocument["_id"] | null>;
  create(properties: Partial<UserDocument>): Promise<UserDocument>;
  findOneByMail(email: string): Promise<UserDocument | null>;
  findByIdAndUpdate(id: UserDocument["_id"], properties: object): Promise<UserDocument | null>;
  findById(id: UserDocument["_id"]): Promise<UserDocument | null>;
  findByIdAndDelete(id: UserDocument["_id"]): Promise<UserDocument | null>;
}
export default class UserClass implements UserClassType {
  async existsByEmail(email: string): Promise<UserDocument["_id"] | null> {
    let userByEmail = await CacheClass.getStringCache(setUniqueEmailStringKey(email));
    if (!userByEmail) {
      const user = (await UserModel.exists({ email })) as UserDocument["_id"];
      if (user) await CacheClass.setStringCache(setUniqueEmailStringKey(email), String(user._id));
      return user;
    }
    return userByEmail;
  }

  async create(properties: Partial<UserDocument>): Promise<UserDocument> {
    const user = await UserModel.create(properties);
    await CacheClass.setHashCache<UserDocument>(setUserHashKey(user._id), user.toObject());
    await CacheClass.setStringCache(setUniqueEmailStringKey(user.email), String(user._id));
    return user;
  }
  async findOneByMail(email: string): Promise<UserDocument | null> {
    const userId = await CacheClass.getStringCache(setUniqueEmailStringKey(email));
    if (userId) {
      const userCache = await CacheClass.getHashCache<UserDocument>(setUserHashKey(userId));
      console.log(userCache);
      if (!userCache) {
        const user = await UserModel.findOne({ email });
        if (user) await CacheClass.setHashCache<UserDocument>(setUserHashKey(userId), user.toObject());
        return user;
      }
      return new UserModel(userCache);
    }
    return null;
  }
  async findByIdAndUpdate(id: UserDocument["_id"], properties: Partial<UserDocument>): Promise<UserDocument | null> {
    Object.entries(CacheClass.serializeCache<Partial<UserDocument>>(properties)).forEach(async ([key, value]) => {
      const typedKey = key as keyof UserDocument;
      await CacheClass.replaceCacheData<UserDocument>(setUserHashKey(id), typedKey, String(value as UserDocument[typeof typedKey]));
    });
    return await UserModel.findByIdAndUpdate(id, properties);
  }
  async findById(id: UserDocument["_id"]): Promise<UserDocument | null> {
    const userCache = await CacheClass.getHashCache<UserDocument>(setUserHashKey(id));
    if (!userCache) {
      const user = await UserModel.findById(id);
      if (user) await CacheClass.setHashCache<UserDocument>(setUserHashKey(id), user.toObject());
      return user;
    }
    return userCache;
  }
  async findByIdAndDelete(id: UserDocument["_id"]): Promise<UserDocument | null> {
    await CacheClass.deleteHashCacheById(setUserHashKey(id));
    return await UserModel.findByIdAndDelete(id);
  }
}
