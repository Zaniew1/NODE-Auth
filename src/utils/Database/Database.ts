import SessionClass, { SessionClassType } from "./SessionDatabase";
import UserClass, { UserClassType } from "./UserDatabase";
import VerificationCodeClass, { VerificationCodeClassType } from "./VerificationCodeDatabase";
class Database {
  constructor(
    public user: UserClassType = UserClass,
    public session: SessionClassType = SessionClass,
    public verificationCode: VerificationCodeClassType = VerificationCodeClass
  ) {}
}

export default new Database();
