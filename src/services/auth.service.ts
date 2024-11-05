import { newUserType } from "../utils/zodSchemas/registerSchema";
// import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import { loginUserType } from "../utils/zodSchemas/loginSchema";
import VerificationCodeModel from "../models/verificationCode.model";
import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import { VerificationCodeType } from "../types/verificationCodeManage";
import { oneYearFromNow } from "../utils/helpers/date";
import { JWT } from "../utils/helpers/Jwt";
import appAssert from "../utils/helpers/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../utils/constants/http";
import AppError from "../utils/helpers/appError";

export const createUser = async (data: newUserType) => {
  const { name, password, email, surname, userAgent } = data as newUserType;

  // check if user exists
  const userByEmail = await UserModel.exists({ email });
  appAssert(!userByEmail, CONFLICT, "User with that email already exists ");

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

export const loginUser = async (data: loginUserType) => {
  console.log("asd");
  const { password, email, userAgent } = data as loginUserType;

  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid user");
  const passIsValid = user.comparePassword(password);
  appAssert(passIsValid, UNAUTHORIZED, "Invalid Password");

  const userId = user._id;
  // create session
  const session = await SessionModel.create({
    userId,
    userAgent: userAgent,
  });
  const sessionInfo = {
    sessionId: session._id,
  };

  // sign access token & refresh
  const refreshToken = JWT.signToken(sessionInfo, "refresh", { audience: ["user"], expiresIn: "30d" });
  const accessToken = JWT.signToken({ ...sessionInfo, userId }, "access", { audience: ["user"], expiresIn: "15m" });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};
