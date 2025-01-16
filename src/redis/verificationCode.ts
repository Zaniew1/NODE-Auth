import { VerificationCodeDocument } from "../auth/model/verificationCode.model";

export const setVerificationCodeHashKey = (id: VerificationCodeDocument["_id"]) => {
  return `verificationCode#${id}`;
};
