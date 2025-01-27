import { UserDocument } from '../user/model/user.model';

/**
 * This function creates key for a user hash in Redis.
 *
 * @param {UserDocument["_id"]} id
 * @returns {string}
 */
export const setUserHashKey = (id: UserDocument['_id']): string => {
  return `user#${id}`;
};
/**
 * This function creates key for a email string in Redis.
 *
 * @param {string} email
 * @returns {string}
 */
export const setUniqueEmailStringKey = (email: string): string => {
  return `email:${email}`;
};
