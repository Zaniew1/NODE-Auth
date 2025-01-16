import { SessionDocument } from "../session/model/session.model";
import { UserDocument } from "../user/model/user.model";
export const setSessionHashKey = (id: SessionDocument["_id"]): string => {
  return `session#${id}`;
};
export const setSessionListKey = (id: UserDocument["_id"]): string => {
  return `user:sessions:${id}`;
};
