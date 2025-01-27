import { HttpErrors } from '../../utils/constants/http';
import appAssert from '../../utils/helpers/appAssert';
import catchAsync from '../../utils/helpers/catchAsync';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Message } from '../../utils/constants/messages';
import { objectIdSchema } from '../../auth/zodSchemas/ObjectIdSchema';
import DatabaseClass from '../../utils/Database/Database';

/**
 * This controller function retrieves a user from cache or Db.
 * It returns user without password (safety).
 *
 * @type {RequestHandler}
 */
export const getUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const user = await DatabaseClass.user.findById(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json(user.omitPassword());
});
/**
 * This controller function deletes a user by id from cache and DB.
 *
 * @type {RequestHandler}
 */
export const deleteUserHandler: RequestHandler = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const user = await DatabaseClass.user.findByIdAndDelete(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_DELETED });
});
