import { VerificationCodeDocument } from '../auth/model/verificationCode.model';
import { UserDocument } from '../user/model/user.model';

/**
 *  This function creates key for a verificationCode hash in Redis.
 *
 * @param {VerificationCodeDocument["_id"]} id
 * @returns {string}
 */
export const setVerificationCodeHashKey = (id: VerificationCodeDocument['_id']) => {
  return `verificationCode#${id}`;
};
/**
 *  This function creates key for a verificationCode string in Redis.
 *
 * @param {UserDocument["_id"]} id
 * @returns {string}
 */
export const setVerificationCodeListKey = (id: UserDocument['_id']) => {
  return `user:verificationCodes:${id}`;
};
