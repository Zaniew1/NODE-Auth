import { HttpErrors } from "../../utils/constants/http";
import appAssert from "../../utils/helpers/appAssert";
import catchAsync from "../../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { Message } from "../../utils/constants/messages";
import { objectIdSchema } from "../../auth/zodSchemas/ObjectIdSchema";
import DatabaseClass from "../../utils/Database/Database";

export const getUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const user = await DatabaseClass.user.findById(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json(user.omitPassword());
});
export const deleteUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const user = await DatabaseClass.user.findByIdAndDelete(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_DELETED });
});
