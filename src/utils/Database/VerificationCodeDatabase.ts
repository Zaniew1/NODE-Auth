import VerificationModel from "../../auth/model/verificationCode.model";
import { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import CacheClass from "../../redis/CacheClass";
import { setVerificationCodeHashKey } from "../../redis/verificationCode";

export interface VerificationCodeClassType {
  create(properties: object): Promise<VerificationCodeDocument>;
  findByIdAndDelete(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null>;
  countDocuments(property: object): Promise<number>;
  findOne(property: object): Promise<VerificationCodeDocument | null>;
}

export default class VerificationCodeClass implements VerificationCodeClassType {
  async create(properties: object): Promise<VerificationCodeDocument> {
    const verificationCode = await VerificationModel.create(properties);
    await CacheClass.setHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(verificationCode._id), verificationCode.toObject());
    return verificationCode;
  }
  async findByIdAndDelete(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null> {
    await CacheClass.deleteHashCacheById(setVerificationCodeHashKey(id));
    return await VerificationModel.findByIdAndDelete(id);
  }
  async countDocuments(property: object): Promise<number> {
    return await VerificationModel.countDocuments(property);
  }
  async findOne(property: object): Promise<VerificationCodeDocument | null> {
    return await VerificationModel.findOne(property);
  }
}
