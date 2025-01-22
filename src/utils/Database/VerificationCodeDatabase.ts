import VerificationModel from "../../auth/model/verificationCode.model";
import { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import CacheClass from "../../redis/CacheClass";
import { setVerificationCodeHashKey, setVerificationCodeListKey } from "../../redis/verificationCode";
import { VerificationCodeType } from "../../types/verificationCodeManage";
import { UserDocument } from "../../user/model/user.model";
import { fiveMinutesAgo } from "../../utils/helpers/date";

export interface VerificationCodeClassType {
  create(properties: Partial<VerificationCodeDocument>): Promise<VerificationCodeDocument>;
  findByIdAndDelete(id: VerificationCodeDocument["_id"]): Promise<VerificationCodeDocument | null>;
  findUsersPasswordResetCodes(
    id: UserDocument["id"],
    type: VerificationCodeType.PasswordReset | VerificationCodeType.EmailVerification
  ): Promise<number>;
  findOneByIdAndType(id: VerificationCodeDocument["_id"], type: string): Promise<VerificationCodeDocument | null>;
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

  async findUsersPasswordResetCodes(
    id: UserDocument["id"],
    type: VerificationCodeType.PasswordReset | VerificationCodeType.EmailVerification
  ): Promise<number> {
    // rate limit
    const fiveMinAgo = fiveMinutesAgo();

    const userVerificationCodesId = await CacheClass.getCacheList(setVerificationCodeListKey(id));
    if (userVerificationCodesId != null) {
      const allUserVerificationCodes = await Promise.all(
        userVerificationCodesId.map(async (id) => CacheClass.getHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(id)))
      );
      const codes = allUserVerificationCodes.filter((el) => el != null && el.type === type && el.createdAt >= fiveMinAgo).length;
      return codes;
    }
    return await VerificationModel.countDocuments({
      userId: id,
      type: VerificationCodeType.PasswordReset,
      createdAt: { $gt: fiveMinAgo },
    });
  }
  async findOneByIdAndType(_id: VerificationCodeDocument["_id"], type: string): Promise<VerificationCodeDocument | null> {
    const verificationCode = await CacheClass.getHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(_id));
    if (!verificationCode || verificationCode.expiresAt < new Date() || verificationCode.type !== type) {
      const code = await VerificationModel.findOne({ _id, type, expiresAt: { $gt: new Date() } });
      if (code) await CacheClass.setHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(code._id), code);
      return code;
    }
    return verificationCode;
  }
}
