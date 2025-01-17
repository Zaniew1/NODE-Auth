import VerificationModel from "../../auth/model/verificationCode.model";
import { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import CacheClass from "../../redis/CacheClass";
import { setVerificationCodeHashKey, setVerificationCodeListKey } from "../../redis/verificationCode";
import { VerificationCodeType } from "../../types/verificationCodeManage";

export interface VerificationCodeClassType {
  create(properties: Partial<VerificationCodeDocument>): Promise<VerificationCodeDocument>;
  findByIdAndDelete(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null>;
  countDocuments(property: object): Promise<number>;
  findOnePasswordResetById(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null>;
}

export default class VerificationCodeClass implements VerificationCodeClassType {
  async create(properties: Partial<VerificationCodeDocument>): Promise<VerificationCodeDocument> {
    const verificationCode = (await VerificationModel.create(properties)) as VerificationCodeDocument;
    await CacheClass.setHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(verificationCode._id), verificationCode.toObject());
    await CacheClass.setCacheList<VerificationCodeDocument["_id"]>(setVerificationCodeListKey(verificationCode.userId), verificationCode._id);
    return verificationCode;
  }
  async findByIdAndDelete(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null> {
    await CacheClass.deleteHashCacheById(setVerificationCodeHashKey(id));
    return await VerificationModel.findByIdAndDelete(id);
  }
  async countDocuments(property: object): Promise<number> {
    return await VerificationModel.countDocuments(property);
  }
  async findOnePasswordResetById(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null> {
    const verificationCode = await CacheClass.getHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(id));
    if (!verificationCode || verificationCode.expiresAt < new Date() || verificationCode.type !== VerificationCodeType.PasswordReset) {
      const code = await VerificationModel.findOne({ _id: id, type: VerificationCodeType.PasswordReset, expiresAt: { $gt: new Date() } });
      if (code) await CacheClass.setHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(code._id), code);
      return code;
    }
    return verificationCode;
  }
}
