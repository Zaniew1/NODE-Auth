import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import registerSchema from "../utils/zodSchemas/registerSchema";

export const registerHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  //  validate data with zod
  const request = registerSchema.parse({ ...req.body, userAgent: req.headers["user-agent"] });

  res.status(200).json({
    status: "successfully create user",
  });
});
export const loginHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully login",
  });
});
export const forgetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully forget pass",
  });
});
export const logoutHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully logout",
  });
});
export const changePasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully changed pass",
  });
});
export const resetPasswordHandler: RequestHandler<{ id: string }> = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: "successfully reseted password",
  });
});
