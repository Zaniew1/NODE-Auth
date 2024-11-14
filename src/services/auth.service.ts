import { newUserType } from "../utils/zodSchemas/registerSchema";
// import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import { loginUserType } from "../utils/zodSchemas/loginSchema";
import VerificationCodeModel from "../models/verificationCode.model";
import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import { VerificationCodeType } from "../types/verificationCodeManage";
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from "../utils/helpers/date";
import { JWT } from "../utils/helpers/Jwt";
import appAssert from "../utils/helpers/appAssert";
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from "../utils/constants/http";
import { APP_ORIGIN, APP_VERSION } from "../utils/constants/env";
import { hashPassword } from "../utils/helpers/PasswordManage";
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
  const url = `${APP_ORIGIN}/api/${APP_VERSION}/verify/${verificationCode._id}`;
  // we send email with welcome Card component as welcome message
  // SmtpMailer.sendWelcome({ email, name, url });

  // create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: userAgent,
  });

  // sign access token & refresh
  const refreshToken = JWT.signRefreshToken({ sessionId: session._id });
  const accessToken = JWT.signAccessToken({ sessionId: session._id, userId: user._id });

  // return user & token
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ password, email, userAgent }: loginUserType) => {
  const user = await UserModel.findOne({ email });
  // validate user and password
  appAssert(user, UNAUTHORIZED, "Invalid user");
  const passIsValid = user.comparePassword(password);
  appAssert(passIsValid, UNAUTHORIZED, "Invalid Password");
  const userId = user._id;
  // create session
  const session = await SessionModel.create({
    userId,
    userAgent: userAgent,
  });
  const sessionInfo = { sessionId: session._id };
  // sign access token & refresh
  const refreshToken = JWT.signRefreshToken(sessionInfo);
  const accessToken = JWT.signAccessToken({ ...sessionInfo, userId });
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshAccessTokenUser = async (refreshToken: string) => {
  const payload = JWT.validateRefreshToken(refreshToken);
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");
  // find session in db
  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(session && session.expiresAt.getTime() > now, UNAUTHORIZED, "Session expired");
  // refresh session if it's coming to the end (1day)
  const sessionExpiringSoon = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionExpiringSoon) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }
  const sessionId = session._id;
  const newRefreshToken = sessionExpiringSoon ? JWT.signRefreshToken({ sessionId }) : undefined;
  const accessToken = JWT.signAccessToken({ userId: session.userId, sessionId });
  return {
    accessToken,
    newRefreshToken,
  };
};
export const verifyUserEmail = async (verificationCode: string) => {
  // get verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");
  // get user and set verified = true
  const verifiedUser = await UserModel.findByIdAndUpdate(validCode.userId, { verified: true }, { new: true });
  appAssert(verifiedUser, INTERNAL_SERVER_ERROR, "Faild to verify user by email");
  // delete verification code
  await validCode.deleteOne();
  return {
    user: verifiedUser.omitPassword(),
  };
};

export const forgotPassword = async (email: string) => {
  //get user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, "User not found");
  // rate limit
  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  ``;
  appAssert(count <= 1, TOO_MANY_REQUESTS, "Too many requests, try again in a few minutes");
  // create verification code
  const expiresAt = oneHourFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });
  const url = `${APP_ORIGIN}/api/${APP_VERSION}/forgotPassword?verificationCode=${verificationCode._id}&exp=${expiresAt.getTime()}`;
  // we send email with reset password
  // SmtpMailer.sendReset({ email, name, url });
  // return message
  return {
    url,
  };
};
export type changePasswordType = {
  verificationCode: string;
  password: string;
};
export const changePassword = async ({ verificationCode, password }: changePasswordType) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");
  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, { password: await hashPassword(password) });
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");
  // delete verification code
  await validCode.deleteOne();
  // delete all sessions
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });
  return {
    user: updatedUser.omitPassword(),
  };
};
