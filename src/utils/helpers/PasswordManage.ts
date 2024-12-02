import bcrypt from "bcryptjs";
import { Message } from "../constants/messages";
import { HttpErrors } from "../constants/http";
import appAssert from "./appAssert";
export const comparePasswords = async (passwordToValidate: string, databasePassword: string) => {
  return await bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
};
export const hashPassword = async (password: string, salt: number = 10) => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (err) {
    appAssert(!err, HttpErrors.NOT_FOUND, Message.FAIL_INTERNAL_SERVER_ERROR);
  }
};
