import redisClient from "./redisClient";
import { serializeCache, deserializeCache, FlatObject } from "./serialize";
import { VerificationCodeDocument } from "../auth/model/verificationCode.model";

export const setVerificationCodeHashKey = (id: VerificationCodeDocument["_id"]) => {
  return `verificationCode#${id}`;
};
