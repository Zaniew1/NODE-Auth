import bcrypt from "bcryptjs";
export const comparePasswords = async (passwordToValidate: string, databasePassword: string) => {
  return await bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
};
export const hashPassword = async (password: string, salt: number = 10) => {
  return await bcrypt.hash(password, salt);
};
