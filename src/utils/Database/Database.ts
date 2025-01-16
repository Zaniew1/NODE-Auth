import SessionClass, { SessionClassType } from "./SessionDatabase";
import UserClass, { UserClassType } from "./UserDatabase";
import VerificationCodeClass, { VerificationCodeClassType } from "./VerificationCodeDatabase";
class Database {
  constructor(
    public user: UserClassType = new UserClass(),
    public session: SessionClassType = new SessionClass(),
    public verificationCode: VerificationCodeClassType = new VerificationCodeClass()
  ) {}
}

export default new Database();
