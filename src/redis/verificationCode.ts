import { VerificationCodeDocument } from "../auth/model/verificationCode.model";
import { UserDocument } from "../user/model/user.model";

export const setVerificationCodeHashKey = (id: VerificationCodeDocument["_id"]) => {
  return `verificationCode#${id}`;
};
export const setVerificationCodeListKey = (id: UserDocument["_id"]) => {
  return `user:verificationCodes:${id}`;
};
