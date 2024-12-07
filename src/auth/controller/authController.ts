import catchAsync from "../../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import registerSchema from "../zodSchemas/registerSchema";
import verificationSchema from "../zodSchemas/verificationSchema";
import loginSchema, { emailSchema } from "../zodSchemas/loginSchema";
import changePassSchema from "../zodSchemas/changePassSchema";
import { Message } from "../../utils/constants/messages";
import {
  createUserService,
  loginUserService,
  refreshAccessTokenUserService,
  verifyUserEmailService,
  changePasswordService,
  forgotPasswordService,
} from "../service/auth.service";
import { HttpErrors } from "../../utils/constants/http";
import CookiesClass from "../../utils/helpers/cookies";
import { JWT } from "../../utils/helpers/Jwt";
import SessionModel from "../../session/model/session.model";
import appAssert from "../../utils/helpers/appAssert";
export const registerHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // validate data with zod
  const request = registerSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
  // create new user, accessToken and refreshToken
  const { user, accessToken, refreshToken } = await createUserService(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(HttpErrors.CREATED).json({
    message: Message.SUCCESS_USER_CREATE,
    user,
  });
});

export const loginHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  // validate data with zod
  const request = loginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
  // validate if email and password are correct, create tokens, create session
  const { accessToken, refreshToken } = await loginUserService(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_LOGIN,
  });
});

export const logoutHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken as string | "";
  appAssert(accessToken, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_ACCESS_MISSING);
  const payload = JWT.validateAccessToken(accessToken || "");
  // remove session from db
  await SessionModel.findByIdAndDelete(payload.sessionId);
  // clear cookies
  return CookiesClass.clearAuthCookies(res).status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_LOGOUT });
});

export const verifyEmailHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const verificationCode = verificationSchema.parse(req.params.code);
  await verifyUserEmailService(verificationCode);
  res.status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_VERIFIED_MAIL,
  });
});

export const forgotPasswordHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const email = emailSchema.parse(req.body.email);
  await forgotPasswordService(email);
  res.status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_FORGET_PASSWORD,
  });
});
export const changePasswordHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const response = changePassSchema.parse(req.body);
  await changePasswordService(response);
  return CookiesClass.clearAuthCookies(res).status(HttpErrors.OK).json({
    message: Message.SUCCESS_USER_CHANGED_PASSWORD,
  });
});

export const refreshHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, HttpErrors.UNAUTHORIZED, Message.FAIL_TOKEN_REFRESH_MISSING);
  const { accessToken, newRefreshToken } = await refreshAccessTokenUserService(refreshToken);
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, CookiesClass.getRefreshTokenCookieOptions());
  }
  console.log(newRefreshToken, accessToken);
  res.status(HttpErrors.OK).cookie("accessToken", accessToken, CookiesClass.getAccessTokenCookieOptions()).json({
    message: Message.SUCCESS_USER_REFRESHED_TOKEN,
  });
});
