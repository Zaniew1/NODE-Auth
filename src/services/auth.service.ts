import { newUserType } from "../utils/zodSchemas/registerSchema";
// import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import VerificationCodeModel from "../models/verificationCode.model";
import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import { VerificationCodeType } from "../types/verificationCodeManage";
import { oneYearFromNow } from "../utils/helpers/date";
import { JWT } from "../utils/helpers/Jwt";
export const createUser = async (data: newUserType) => {
  const { name, password, email, surname, userAgent } = data as newUserType;
  // check if user exists
  const userByEmail = await UserModel.exists({ email });
  if (userByEmail) {
    throw new Error("User with that email already exists");
  }
  //  create user
  const user = await UserModel.create({ email, password });

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // we send email with welcome Card component as welcome message
  // SmtpMailer.sendWelcome({ email, name, url: verificationCode });

  // create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: userAgent,
  });

  // sign access token & refresh
  const refreshToken = JWT.signToken({ sessionId: session._id }, "refresh", { audience: ["user"], expiresIn: "30d" });
  const accessToken = JWT.signToken({ sessionId: session._id, userId: user._id }, "access", { audience: ["user"], expiresIn: "15m" });

  // return user & token
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};
