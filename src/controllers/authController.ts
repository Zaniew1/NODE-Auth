import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import registerSchema from "../utils/zodSchemas/registerSchema";
import { createUser } from "../services/auth.service";
import { CREATED, OK } from "../utils/constants/http";
import { setAuthCookies } from "../utils/helpers/cookies";

export const registerHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //  validate data with zod
  const request = registerSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });
  // create new user, accessToken and refreshToken
  const { user, accessToken, refreshToken } = await createUser(request);
  return setAuthCookies({ res, accessToken, refreshToken }).status(CREATED).json({
    status: "successfully create user",
    user,
  });
});
export const loginHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully login",
  });
});
export const forgetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully forget pass",
  });
});
export const logoutHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(OK).json({
    status: "successfully logout",
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
