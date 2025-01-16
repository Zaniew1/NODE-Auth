import { newUserType } from "../zodSchemas/registerSchema";
// import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import { loginUserType } from "../zodSchemas/loginSchema";
import VerificationCodeModel, { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import UserModel from "../../user/model/user.model";
import SessionModel from "../../session/model/session.model";
import { VerificationCodeType } from "../../types/verificationCodeManage";
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from "../../utils/helpers/date";
import { JWT } from "../../utils/helpers/Jwt";
import appAssert from "../../utils/helpers/appAssert";
import { APP_ORIGIN, APP_VERSION, PORT } from "../../utils/constants/env";
import { hashPassword } from "../../utils/helpers/PasswordManage";
import { Message } from "../../utils/constants/messages";
import { HttpErrors } from "../../utils/constants/http";
import DatabaseClass from "../../utils/Database/Database";
export const testSer = async () => {};

export const createUserService = async (data: newUserType) => {
  const { name, password, email, surname, userAgent } = data as newUserType;
  //check user existance and create if not exist
  const userByEmail = await DatabaseClass.user.existsByEmail(email);
  appAssert(!userByEmail, HttpErrors.CONFLICT, Message.FAIL_USER_EMAIL_EXIST);
  const user = await DatabaseClass.user.create({ email, userAgent, password, name, surname });

  // create verification code
  const verificationCode = await DatabaseClass.verificationCode.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // we send email with welcome Card component as welcome message
  const url = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/verify/${verificationCode._id}`;
  // SmtpMailer.sendWelcome({ email, name, url });

  // // create session
  const session = await DatabaseClass.session.create({
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

export const loginUserService = async ({ password, email, userAgent }: loginUserType) => {
  const user = await DatabaseClass.user.findOneByMail(email);
  appAssert(user, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_INVALID);
  const passIsValid = user.comparePassword(password);
  appAssert(passIsValid, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_INVALID_PASSWORD);

  // create session
  const session = await DatabaseClass.session.create({
    userId: user._id,
    userAgent: userAgent,
  });
  const sessionInfo = { sessionId: session._id };

  // sign access token & refresh
  const refreshToken = JWT.signRefreshToken(sessionInfo);
  const accessToken = JWT.signAccessToken({ ...sessionInfo, userId: user._id });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshAccessTokenUserService = async (refreshToken: string) => {
  const payload = JWT.validateRefreshToken(refreshToken);
  appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_REFRESH_INVALID);
  // find session in db
  // let session = await getHashCache<SessionDocument>(setSessionHashKey(payload.sessionId));
  // if (!session) {
  let session = await SessionModel.findById(payload.sessionId);
  // }
  const now = Date.now();
  appAssert(session && session.expiresAt.getTime() > now, HttpErrors.UNAUTHORIZED, Message.FAIL_SESSION_EXPIRED);
  // refresh session if it's coming to the end (1day)
  const sessionExpiringSoon = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionExpiringSoon === true) {
    session.expiresAt = thirtyDaysFromNow();
    // await replaceCacheData<SessionDocument>(setSessionHashKey(payload.sessionId), "expiresAt", String(thirtyDaysFromNow()));
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
export const verifyUserEmailService = async (verificationCode: VerificationCodeDocument["_id"]) => {
  let validCode = await DatabaseClass.verificationCode.findByIdAndDelete(verificationCode);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);
  // get user and set verified = true
  // await replaceCacheData<UserDocument>(setUserHashKey(validCode.userId), "verified", String(true));
  const verifiedUser = await DatabaseClass.user.findByIdAndUpdate(validCode.userId, { verified: true });
  // const verifiedUser = await UserModel.findByIdAndUpdate(validCode.userId, { verified: true }, { new: true });
  appAssert(verifiedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_UNVERIFIED);
  // delete verification code
  await validCode.deleteOne();
  // await deleteHashCacheById(setVerificationCodeHashKey(validCode._id));
  return {
    user: verifiedUser.omitPassword(),
  };
};

export const forgotPasswordService = async (email: string) => {
  /////////////////////////////// TUTAJ DOROBIĆ
  //get user by email
  // let user = await getUserByEmailCache(email);
  // if (!user) {
  let user = await UserModel.findOne({ email });
  // }
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  // rate limit
  const fiveMinAgo = fiveMinutesAgo();

  /////////////////////////////// TUTAJ DOROBIĆ
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  ``;
  appAssert(count <= 1, HttpErrors.TOO_MANY_REQUESTS, Message.FAIL_REQUESTS_TOO_MANY);
  // create verification code
  const expiresAt = oneHourFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });
  // await setHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(verificationCode._id), verificationCode.toObject());

  const url = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/auth/changePassword?verificationCode=${verificationCode._id}&exp=${expiresAt.getTime()}`;
  // we send email with reset password
  // SmtpMailer.sendReset({ email, name, url });
  return {
    url,
  };
};
export type changePasswordType = {
  verificationCode: string;
  password: string;
};
export const changePasswordService = async ({ verificationCode, password }: changePasswordType) => {
  // let validCode = await getHashCache<VerificationCodeDocument>(setVerificationCodeHashKey(verificationCode));
  // if (!validCode) {
  let validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  // }
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);

  const newPassword = await hashPassword(password);
  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, { password: newPassword });
  // await replaceCacheData<UserDocument>(setUserHashKey(validCode.userId), "password", newPassword);
  appAssert(updatedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_PASSWORD_RESET);
  // delete verification code
  await validCode.deleteOne();
  // await deleteHashCacheById(setVerificationCodeHashKey(verificationCode));
  // delete all sessions
  /////////////////////////////// TUTAJ DOROBIĆ
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });
  // await deleteUserSessionsCache(updatedUser._id);
  return {
    user: updatedUser.omitPassword(),
  };
};
