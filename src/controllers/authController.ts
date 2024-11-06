import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import registerSchema from "../utils/zodSchemas/registerSchema";
import loginSchema from "../utils/zodSchemas/loginSchema";
import { createUser, loginUser, refreshAccessTokenUser } from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../utils/constants/http";
import CookiesClass from "../utils/helpers/cookies";
import { JWT } from "../utils/helpers/Jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/helpers/appAssert";
export const registerHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // validate data with zod
  const request = registerSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
  // create new user, accessToken and refreshToken
  const { user, accessToken, refreshToken } = await createUser(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json({
    status: "successfully create user",
    user,
  });
});

export const loginHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // validate data with zod
  const request = loginSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
  // validate if email and password are correct, create tokens, create session
  const { accessToken, refreshToken } = await loginUser(request);
  // set cookies
  return CookiesClass.setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    status: "successfully login",
  });
});

export const logoutHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | "";
  appAssert(accessToken, UNAUTHORIZED, "Missing access token");

  const payload = JWT.validateAccessToken(accessToken || "");
  appAssert(payload, UNAUTHORIZED, "Invalid access token");
  // remove session from db
  await SessionModel.findByIdAndDelete(payload.sessionId);
  // clear cookies
  return CookiesClass.clearAuthCookies(res).status(OK).json({ message: "Logout successful" });
});

export const refreshHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");
  const { accessToken, newRefreshToken } = await refreshAccessTokenUser(refreshToken);
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, CookiesClass.getRefreshTokenCookieOptions());
  }
  res.status(OK).cookie("accessToken", accessToken, CookiesClass.getAccessTokenCookieOptions()).json({
    status: "successfully reseted password",
  });
});

export const forgetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully forget pass",
  });
});

export const changePasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully changed pass",
  });
});

export const resetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully reseted password",
  });
});
