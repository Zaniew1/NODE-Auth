import appAssert from '../../utils/helpers/appAssert';
import PrismaDatabase from '../../utils/Database/PrismaDatabase';
import { JWT } from '../../utils/helpers/Jwt';
import { Message } from '../../utils/constants/messages';
import { HttpErrors } from '../../utils/constants/http';
import { newUserType } from '../zodSchemas/registerSchema';
import { hashPassword, comparePasswords } from '../../utils/helpers/PasswordManage';
import { loginUserType } from '../zodSchemas/loginSchema';
import { VerificationCodeType } from '../../types/verificationCodeManage';
import { APP_ORIGIN, APP_VERSION, PORT } from '../../utils/constants/env';
import { ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from '../../utils/helpers/date';

export type changePasswordType = {
  verificationCode: string;
  password: string;
};

export const createUserService = async (data: newUserType) => {
  const { email, userAgent } = data;
  const userByEmail = await PrismaDatabase.user.existsByEmail(email);
  appAssert(!userByEmail, HttpErrors.CONFLICT, Message.FAIL_USER_EMAIL_EXIST);

  const { confirmPassword: _, ...userData } = data;
  const user = await PrismaDatabase.user.create(userData);

  const verificationCode = await PrismaDatabase.verificationCode.create({
    userId: user.id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // SmtpMailer.sendWelcome({ email, name, url });
  const url = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/verify/${verificationCode.id}`;

  const session = await PrismaDatabase.session.create({ userId: user.id, userAgent });
  const refreshToken = JWT.signRefreshToken({ sessionId: session.id });
  const accessToken = JWT.signAccessToken({ sessionId: session.id, userId: user.id });

  const { password: _p, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUserService = async ({ password, email, userAgent }: loginUserType) => {
  const user = await PrismaDatabase.user.findOneByMail(email);
  appAssert(user, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_INVALID);
  const passIsValid = await comparePasswords(password, user.password);
  appAssert(passIsValid, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_INVALID_PASSWORD);

  const session = await PrismaDatabase.session.create({ userId: user.id, userAgent });
  const sessionInfo = { sessionId: session.id };
  const refreshToken = JWT.signRefreshToken(sessionInfo);
  const accessToken = JWT.signAccessToken({ ...sessionInfo, userId: user.id });

  const { password: _p, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAccessTokenUserService = async (refreshToken: string) => {
  const payload = JWT.validateRefreshToken(refreshToken);
  appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_REFRESH_INVALID);
  const session = await PrismaDatabase.session.findById(payload.sessionId);
  const now = Date.now();
  appAssert(session && new Date(session.expiresAt).getTime() > now, HttpErrors.UNAUTHORIZED, Message.FAIL_SESSION_EXPIRED);
  const sessionExpiringSoon = new Date(session.expiresAt).getTime() - now <= ONE_DAY_MS;
  if (sessionExpiringSoon) {
    await PrismaDatabase.session.findByIdAndUpdate(session.id, { expiresAt: thirtyDaysFromNow() });
  }
  const sessionId = session.id;
  const newRefreshToken = sessionExpiringSoon ? JWT.signRefreshToken({ sessionId }) : undefined;
  const accessToken = JWT.signAccessToken({ userId: session.userId, sessionId });
  return { accessToken, newRefreshToken };
};

export const verifyUserEmailService = async (verificationCode: string) => {
  const validCode = await PrismaDatabase.verificationCode.findOneByIdAndType(verificationCode, VerificationCodeType.EmailVerification);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);
  const verifiedUser = await PrismaDatabase.user.findByIdAndUpdate(validCode.userId, { verified: true });
  appAssert(verifiedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_UNVERIFIED);
  await PrismaDatabase.verificationCode.findByIdAndDelete(validCode.id);
  const { password: _p, ...userWithoutPassword } = verifiedUser;
  return { user: userWithoutPassword };
};

export const forgotPasswordService = async (email: string) => {
  const user = await PrismaDatabase.user.findOneByMail(email);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  const count = await PrismaDatabase.verificationCode.findUsersCodes(user.id, VerificationCodeType.PasswordReset);
  appAssert(count <= 1, HttpErrors.TOO_MANY_REQUESTS, Message.FAIL_REQUESTS_TOO_MANY);

  const expiresAt = oneHourFromNow();
  const verificationCode = await PrismaDatabase.verificationCode.create({
    userId: user.id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // SmtpMailer.sendReset({ email, name, url });
  const url = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/auth/changePassword?verificationCode=${verificationCode.id}&exp=${expiresAt.getTime()}`;
  return { url };
};

export const changePasswordService = async ({ verificationCode, password }: changePasswordType) => {
  const validCode = await PrismaDatabase.verificationCode.findOneByIdAndType(verificationCode, VerificationCodeType.PasswordReset);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);

  const newPassword = await hashPassword(password);
  const updatedUser = await PrismaDatabase.user.findByIdAndUpdate(validCode.userId, { password: newPassword });
  appAssert(updatedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_PASSWORD_RESET);

  await PrismaDatabase.verificationCode.findByIdAndDelete(validCode.id);
  await PrismaDatabase.session.deleteManyByUserId(updatedUser.id);

  const { password: _p, ...userWithoutPassword } = updatedUser;
  return { user: userWithoutPassword };
};
