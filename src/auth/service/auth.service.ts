import appAssert from '../../utils/helpers/appAssert';
import DatabaseClass from '../../utils/Database/Database';
// import { SmtpMailer } from '../../../../NODE-Mailer/mailer';
import { JWT } from '../../utils/helpers/Jwt';
import { Message } from '../../utils/constants/messages';
import { HttpErrors } from '../../utils/constants/http';
import { newUserType } from '../zodSchemas/registerSchema';
import { hashPassword } from '../../utils/helpers/PasswordManage';
import { loginUserType } from '../zodSchemas/loginSchema';
import { VerificationCodeType } from '../../types/verificationCodeManage';
import { VerificationCodeDocument } from '../../auth/model/verificationCode.model';
import { APP_ORIGIN, APP_VERSION, PORT } from '../../utils/constants/env';
import { ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from '../../utils/helpers/date';

export type changePasswordType = {
  verificationCode: string;
  password: string;
};

/**
 * This service checks if user with given email already exists.  If no then creates user,
 * his session and verification code for email verification. Also sends a mail with this verification code
 * Then returns created user with accessToken and refreshToken
 *
 * @async
 * @param {newUserType} data
 * @returns {user, accessToken, refreshToken}
 */
export const createUserService = async (data: newUserType) => {
  const { email, userAgent } = data as newUserType;
  //check user existance and create if not exist
  const userByEmail = await DatabaseClass.user.existsByEmail(email);
  appAssert(!userByEmail, HttpErrors.CONFLICT, Message.FAIL_USER_EMAIL_EXIST);
  const user = await DatabaseClass.user.create(data);

  // create verification code
  const verificationCode = await DatabaseClass.verificationCode.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  //  send email with welcome Card component as welcome message
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

/**
 * This service checks if user exists, then compares password given by a user and that one in database.
 * If its the same then creates session for this user, and based of that session and user creates accessToken and refresh token via JWT
 * Then returns user(without password), refresh token and access token
 *
 * @async
 * @param {loginUserType} param0
 * @param {loginUserType} param0.password
 * @param {loginUserType} param0.email
 * @param {loginUserType} param0.userAgent
 * @returns {user, accessToken, refreshToken}
 */
export const loginUserService = async ({ password, email, userAgent }: loginUserType) => {
  //validate user and password
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

/**
 * This service serves as a refresher for a session. If session is close to being expired (below 1 day),
 * then it will update session property "expiresAt" to another month in the future.
 * At the end it creates new tokens.
 *
 * @async
 * @param {string} refreshToken
 * @returns {typeof accessToken, newRefreshToken}
 */
export const refreshAccessTokenUserService = async (refreshToken: string) => {
  const payload = JWT.validateRefreshToken(refreshToken);
  appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_REFRESH_INVALID);
  const session = await DatabaseClass.session.findById(payload.sessionId);
  const now = Date.now();
  appAssert(session && new Date(session.expiresAt).getTime() > now, HttpErrors.UNAUTHORIZED, Message.FAIL_SESSION_EXPIRED);
  // refresh session if it's coming to the end (1day)
  const sessionExpiringSoon = new Date(session.expiresAt).getTime() - now <= ONE_DAY_MS;
  if (sessionExpiringSoon === true) {
    await DatabaseClass.session.findByIdAndUpdate(session._id, { expiresAt: thirtyDaysFromNow() });
  }
  const sessionId = session._id;
  const newRefreshToken = sessionExpiringSoon ? JWT.signRefreshToken({ sessionId }) : undefined;
  const accessToken = JWT.signAccessToken({ userId: session.userId, sessionId });

  return {
    accessToken,
    newRefreshToken,
  };
};
/**
 * This service serves as email verifier. First it checks if verificationCode (from mail) is valid. Then updates users property (verify : true).
 * Then deletes verification code that was used to validate verification code from a email. And returns user (no password)
 *
 * @async
 * @param {VerificationCodeDocument['_id']} verificationCode
 * @returns {user}
 */
export const verifyUserEmailService = async (verificationCode: VerificationCodeDocument['_id']) => {
  const validCode = await DatabaseClass.verificationCode.findOneByIdAndType(verificationCode, VerificationCodeType.EmailVerification);
  appAssert(validCode, HttpErrors.NOT_FOUND, Message.FAIL_VERIFICATION_CODE_INVALID);
  // get user and set verified = true
  const verifiedUser = await DatabaseClass.user.findByIdAndUpdate(validCode.userId, { verified: true });
  appAssert(verifiedUser, HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_USER_UNVERIFIED);
  // delete verification code
  await DatabaseClass.verificationCode.findByIdAndDelete(validCode._id);
  return {
    user: verifiedUser.omitPassword(),
  };
};

/**
 * This service makes possible for a user to send mail with new password, if he forgets his password.
 * First user with given email is validated. Then service checks how many codes were sent recently (rate limiting).
 * Then verification is being sent to an email - 1 hour valid.
 *
 * @async
 * @param {string} email
 * @returns {url}
 */
export const forgotPasswordService = async (email: string) => {
  const user = await DatabaseClass.user.findOneByMail(email);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  const count = await DatabaseClass.verificationCode.findUsersCodes(user._id, VerificationCodeType.PasswordReset);
  appAssert(count <= 1, HttpErrors.TOO_MANY_REQUESTS, Message.FAIL_REQUESTS_TOO_MANY);

  const expiresAt = oneHourFromNow();
  // create verification code
  const verificationCode = await DatabaseClass.verificationCode.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // we send email with reset password
  const url = `${APP_ORIGIN}:${PORT}/api/${APP_VERSION}/auth/changePassword?verificationCode=${verificationCode._id}&exp=${expiresAt.getTime()}`;
  // SmtpMailer.sendReset({ email, name, url });
  return {
    url,
  };
};

/**
 * This service is being used when user clicks his forget password message on his email.
 * First verification code is being checked. If it is in DB, new password is generated and user's pass is updated.
 * At the end verificationCode and all of user's sessions are deleted (prevent hackers).
 *
 *
 * @async
 * @param {changePasswordType} param0
 * @param {VerificationCodeType} param0.verificationCode
 * @param {string} param0.password
 * @returns {user} - without pass
 */
export const changePasswordService = async ({ verificationCode, password }: changePasswordType) => {
  // find verification code that has been sent via mail
  const validCode = await DatabaseClass.verificationCode.findOneByIdAndType(verificationCode, VerificationCodeType.PasswordReset);
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
