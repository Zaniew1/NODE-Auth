import { UserDocument } from "../../user/model/user.model";
import UserModel from "../../user/model/user.model";
import CacheClass from "../../redis/CacheClass";
import { setUniqueEmailStringKey, setUserHashKey } from "../../redis/user";
import { newUserType, UserType } from "../../auth/zodSchemas/registerSchema";
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
      return await UserModel.exists({ email });
    }
    return userByEmail;
  }
  async create(properties: newUserType): Promise<UserDocument> {
    const user = await UserModel.create(properties);
    await CacheClass.setHashCache<UserDocument>(setUserHashKey(user._id), user.toObject());
    await CacheClass.setStringCache(setUniqueEmailStringKey(user.email), String(user._id));
    return user;
  }
  async findOneByMail(email: string): Promise<UserDocument | null> {
    const userId = await CacheClass.getStringCache(setUniqueEmailStringKey(email));
    const user = await CacheClass.getHashCache<UserDocument>(setUserHashKey(userId));
    if (!user) {
      return await UserModel.findOne({ email });
    }
    return new UserModel(user);
  }
  async findByIdAndUpdate<T extends UserDocument>(id: UserDocument["_id"], properties: T): Promise<UserDocument | null> {
    await CacheClass.setHashCache<UserDocument>(setUserHashKey(id), properties);
    return await UserModel.findByIdAndUpdate(id, properties);
  }
  async findById(id: UserDocument["_id"]): Promise<UserDocument | null> {
    const user = await CacheClass.getHashCache<UserDocument>(setUserHashKey(id));
    if (!user) {
      return await UserModel.findById(id);
    }
    return user;
  }
  async findByIdAndDelete(id: UserDocument["_id"]): Promise<UserDocument | null> {
    await CacheClass.deleteHashCacheById(setUserHashKey(id));
    return await UserModel.findByIdAndDelete(id);
  }
}
