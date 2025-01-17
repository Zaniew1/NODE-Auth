import { newUserType } from "../zodSchemas/registerSchema";
// import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import { loginUserType } from "../zodSchemas/loginSchema";
import VerificationCodeModel, { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import { VerificationCodeType } from "../../types/verificationCodeManage";
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from "../../utils/helpers/date";
import { JWT } from "../../utils/helpers/Jwt";
import appAssert from "../../utils/helpers/appAssert";
import { APP_ORIGIN, APP_VERSION, PORT } from "../../utils/constants/env";
import { hashPassword } from "../../utils/helpers/PasswordManage";
import { Message } from "../../utils/constants/messages";
import { HttpErrors } from "../../utils/constants/http";
import DatabaseClass from "../../utils/Database/Database";
import { UserDocument } from "../../user/model/user.model";
export const testSer = async () => {};

export const createUserService = async (data: newUserType) => {
  const { name, password, email, surname, userAgent } = data as newUserType;
  //check user existance and create if not exist
  const userByEmail = await DatabaseClass.user.existsByEmail(email);
  appAssert(userByEmail, HttpErrors.CONFLICT, Message.FAIL_USER_EMAIL_EXIST);
  const user = await DatabaseClass.user.create({ email, userAgent, password, name, surname });

  // create verification code
  const verificationCode = await DatabaseClass.verificationCode.create({
    userId: user._id as UserDocument["_id"],
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
  const session = await DatabaseClass.session.findById(payload.sessionId);
  const now = Date.now();
  appAssert(session && session.expiresAt.getTime() > now, HttpErrors.UNAUTHORIZED, Message.FAIL_SESSION_EXPIRED);

  // refresh session if it's coming to the end (1day)
  const sessionExpiringSoon = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionExpiringSoon === true) {
    await DatabaseClass.session.findByIdAndUpdate(session._id, { expiresAt: thirtyDaysFromNow() });
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
  let validCode = await DatabaseClass.verificationCode.findOnePasswordResetById(verificationCode);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);
  // get user and set verified = true
  const verifiedUser = await DatabaseClass.user.findByIdAndUpdate(validCode.userId, { verified: true });
  appAssert(verifiedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_UNVERIFIED);
  // delete verification code
  await DatabaseClass.verificationCode.findByIdAndDelete(verificationCode);

  await DatabaseClass.verificationCode.findByIdAndDelete(validCode._id);
  return {
    user: verifiedUser.omitPassword(),
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await DatabaseClass.user.findOneByMail(email);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  // rate limit
  const fiveMinAgo = fiveMinutesAgo();

  /////////////////////////////// TUTAJ DOROBIĆ ?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  appAssert(count <= 1, HttpErrors.TOO_MANY_REQUESTS, Message.FAIL_REQUESTS_TOO_MANY);
  const expiresAt = oneHourFromNow();
  // create verification code
  const verificationCode = await DatabaseClass.verificationCode.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

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
  // find verification code that has been sent via mail
  const validCode = await DatabaseClass.verificationCode.findOnePasswordResetById(verificationCode);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);

  const newPassword = await hashPassword(password);
  //update password
  const updatedUser = await DatabaseClass.user.findByIdAndUpdate(validCode.userId, { password: newPassword });
  appAssert(updatedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_PASSWORD_RESET);

  // delete verification code
  await DatabaseClass.verificationCode.findByIdAndDelete(validCode._id);
  // delete all sessions
  await DatabaseClass.session.deleteManyByUserId(updatedUser._id);

  return {
    user: updatedUser.omitPassword(),
  };
};
