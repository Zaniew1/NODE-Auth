import bcrypt from "bcryptjs";
export const comparePasswords = async (passwordToValidate: string, databasePassword: string) => {
  return bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
};
export const hashPassword = async (password: string, salt: number = 10) => {
  return bcrypt.hash(password, salt);
};
