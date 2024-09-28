import bcrypt from "bcryptjs";

interface PasswordManageType {
  comparePasswords(passwordToValidate: string, databasePassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

class PasswordManageClass implements PasswordManageType {
  private salt;
  constructor(salt: number) {
    this.salt = salt;
  }
  public async comparePasswords(passwordToValidate: string, databasePassword: string) {
    return await bcrypt.compare(passwordToValidate, databasePassword);
  }
  public async hashPassword(password: string) {
    return await bcrypt.hash(password, this.salt);
  }
}
export const PasswordManage = new PasswordManageClass(10);
