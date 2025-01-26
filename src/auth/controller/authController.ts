import {
  createUserService,
  loginUserService,
  refreshAccessTokenUserService,
  verifyUserEmailService,
  changePasswordService,
  forgotPasswordService,
} from '../service/auth.service';
import appAssert from '../../utils/helpers/appAssert';
import catchAsync from '../../utils/helpers/catchAsync';
import CookiesClass from '../../utils/helpers/cookies';
import DatabaseClass from '../../utils/Database/Database';
import registerSchema from '../zodSchemas/registerSchema';
import changePassSchema from '../zodSchemas/changePassSchema';
import verificationSchema from '../zodSchemas/verificationSchema';
import loginSchema, { emailSchema } from '../zodSchemas/loginSchema';
import { JWT } from '../../utils/helpers/Jwt';
import { Message } from '../../utils/constants/messages';
import { HttpErrors } from '../../utils/constants/http';
import { RequestHandler, Request, Response, NextFunction } from 'express';

/**
 * Validates data sent by user, creates user, session and email verification code.
 * Assigns cookies - refreshToken and accessToken for future authorization, sends 201 status with message.
 *
 * @type {RequestHandler}
 */
export const registerHandler: RequestHandler = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // validate data with zod
  const request = registerSchema.parse({ ...req.body, userAgent: req.headers['user-agent'] });
  // create new user, accessToken and refreshToken
  const { user, accessToken, refreshToken } = await createUserService(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(HttpErrors.CREATED).json({
    message: Message.SUCCESS_USER_CREATE,
    user,
  });
});

/**
 * Validates data sent by user, login user.
 * Assigns cookies - refreshToken and accessToken for future authorization, sends 200 status with message.
 *
 * @type {RequestHandler}
 */
export const loginHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  // validate data with zod
  const request = loginSchema.parse({ ...req.body, userAgent: req.headers['user-agent'] });
  // validate if email and password are correct, create tokens, create session
  const { accessToken, refreshToken } = await loginUserService(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_LOGIN,
  });
});

/**
 * Validates data sent by user, logs out user. Deletes user's session.
 * Clears cookies - refreshToken and accessToken, sends 200 status with message.
 *
 * @type {RequestHandler}
 */
export const logoutHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken as string | '';
  appAssert(accessToken, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_ACCESS_MISSING);
  const payload = JWT.validateAccessToken(accessToken);
  // remove session from db
  await DatabaseClass.session.findByIdAndDelete(payload.sessionId);
  // clear cookies
  return CookiesClass.clearAuthCookies(res).status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_LOGOUT });
});

/**
 * Validates data sent by user, updates users's property "verified: true".
 * Sends 200 status with message.
 *
 * @type {RequestHandler}
 */
export const verifyEmailHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const verificationCode = verificationSchema.parse(req.params.code);
  await verifyUserEmailService(verificationCode);
  res.status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_VERIFIED_MAIL,
  });
});

/**
 * Validates email sent by user, sends email with password reset code.
 * Sends 200 status with message.
 *
 * @type {RequestHandler}
 */
export const forgotPasswordHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const email = emailSchema.parse(req.body.email);
  await forgotPasswordService(email);
  res.status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_FORGET_PASSWORD,
  });
});
/**
 * Validates data sent by user, updates user's password and deletes all of his sessions.
 * Clears all of his cookies, sends 200 status with message.
 *
 * @type {RequestHandler}
 */
export const changePasswordHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const response = changePassSchema.parse(req.body);
  await changePasswordService(response);
  return CookiesClass.clearAuthCookies(res).status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_CHANGED_PASSWORD,
  });
});

/**
 * If user's session is almost expired (less than 1 day) then it updates session for another 30 days.
 * If session was almost expired then updates also cookie refreshToken. If not then returns only new accessToken.
 *
 * @type {RequestHandler}
 */
export const refreshHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_REFRESH_MISSING);
  const { accessToken, newRefreshToken } = await refreshAccessTokenUserService(refreshToken);
  if (newRefreshToken) {
    res.cookie('refreshToken', newRefreshToken, CookiesClass.getRefreshTokenCookieOptions());
  }
  res.status(HttpErrors.OK).cookie('accessToken', accessToken, CookiesClass.getAccessTokenCookieOptions()).json({
    message: Message.SUCCESS_USER_REFRESHED_TOKEN,
  });
});
