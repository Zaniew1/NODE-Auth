import { SessionDocument } from '../session/model/session.model';
import { UserDocument } from '../user/model/user.model';
/**
 * This function creates key for a session hash in Redis.
 *
 * @param {SessionDocument["_id"]} id
 * @returns {string}
 */
export const setSessionHashKey = (id: SessionDocument['_id']): string => {
  return `session#${id}`;
};
/**
 * This function creates key for a user sessios list in Redis.
 *
 * @param {UserDocument["_id"]} id
 * @returns {string}
 */
export const setSessionListKey = (id: UserDocument['_id']): string => {
  return `user:sessions:${id}`;
};
