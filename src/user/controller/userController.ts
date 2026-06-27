import { HttpErrors } from '../../utils/constants/http';
import appAssert from '../../utils/helpers/appAssert';
import catchAsync from '../../utils/helpers/catchAsync';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Message } from '../../utils/constants/messages';
import PrismaDatabase from '../../utils/Database/PrismaDatabase';
import z from 'zod';

export const getUserHandler: RequestHandler = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const userID = z.string().min(1).parse(res.locals.userId);
  const user = await PrismaDatabase.user.findById(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  const { password: _p, ...userWithoutPassword } = user;
  res.status(HttpErrors.OK).json(userWithoutPassword);
});

export const deleteUserHandler: RequestHandler = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const userID = z.string().min(1).parse(res.locals.userId);
  const user = await PrismaDatabase.user.findByIdAndDelete(userID);
  appAssert(user, HttpErrors.NOT_FOUND, Message.FAIL_USER_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_USER_DELETED });
});
