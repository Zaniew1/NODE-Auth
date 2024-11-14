import UserModel from "../models/user.model";
import { NOT_FOUND, OK } from "../utils/constants/http";
import appAssert from "../utils/helpers/appAssert";
import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";

export const getUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findById(res.locals.userId);
  appAssert(user, NOT_FOUND, "User not found");
  res.status(OK).json(user.omitPassword());
});
export const deleteUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findByIdAndDelete(res.locals.userId);
  appAssert(user, NOT_FOUND, "User not found");
  res.status(OK).json({ message: "usersuccessfully deleted" });
});
