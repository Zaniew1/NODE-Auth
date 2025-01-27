import SessionClass, { SessionClassType } from './SessionDatabase';
import UserClass, { UserClassType } from './UserDatabase';
import VerificationCodeClass, { VerificationCodeClassType } from './VerificationCodeDatabase';
/**
 * This class is an abstraction layer through which you can choose which model you want to operate on.
 * The correct usage is Database.user.[method name].
 *
 * @class Database
 * @typedef {Database}
 */
class Database {
  /**
   * Creates an instance of Database.
   *
   * @constructor
   * @param {UserClassType} [user=new UserClass()]
   * @param {SessionClassType} [session=new SessionClass()]
   * @param {VerificationCodeClassType} [verificationCode=new VerificationCodeClass()]
   */
  constructor(
    public user: UserClassType = new UserClass(),
    public session: SessionClassType = new SessionClass(),
    public verificationCode: VerificationCodeClassType = new VerificationCodeClass(),
  ) {}
}

export default new Database();
