import PrismaUserClass, { PrismaUserClassType } from './PrismaUserDatabase';
import PrismaSessionClass, { PrismaSessionClassType } from './PrismaSessionDatabase';
import PrismaVerificationCodeClass, { PrismaVerificationCodeClassType } from './PrismaVerificationCodeDatabase';

class PrismaDatabase {
  constructor(
    public user: PrismaUserClassType = new PrismaUserClass(),
    public session: PrismaSessionClassType = new PrismaSessionClass(),
    public verificationCode: PrismaVerificationCodeClassType = new PrismaVerificationCodeClass(),
  ) {}
}

export default new PrismaDatabase();
