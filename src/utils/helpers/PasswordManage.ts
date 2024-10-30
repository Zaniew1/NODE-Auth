import bcrypt from "bcryptjs";

interface PasswordManageType {
  comparePasswords(passwordToValidate: string, databasePassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

class PasswordManageClass implements PasswordManageType {
  public async comparePasswords(passwordToValidate: string, databasePassword: string) {
    return await bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
  }
  public async hashPassword(password: string, salt?: number) {
    return await bcrypt.hash(password, salt ?? 10);
  }
}
export const PasswordManage = new PasswordManageClass();
