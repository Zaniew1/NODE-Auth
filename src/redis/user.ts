import { UserDocument } from "../user/model/user.model";

export const setUserHashKey = (id: UserDocument["_id"]): string => {
  return `user#${id}`;
};
export const setUniqueEmailStringKey = (email: string): string => {
  return `email:${email}`;
};
