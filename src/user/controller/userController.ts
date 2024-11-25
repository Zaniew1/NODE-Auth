import UserModel from "../model/user.model";
import { HttpErrors } from "../../utils/constants/http";
import appAssert from "../../utils/helpers/appAssert";
import catchAsync from "../../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { Message } from "../../utils/constants/messages";

export const getUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findById(res.locals.userId);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json(user.omitPassword());
});
export const deleteUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findByIdAndDelete(res.locals.userId);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_DELETED });
});