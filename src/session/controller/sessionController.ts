import { HttpErrors } from '../../utils/constants/http';
import appAssert from '../../utils/helpers/appAssert';
import catchAsync from '../../utils/helpers/catchAsync';
import { Message } from '../../utils/constants/messages';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import PrismaDatabase from '../../utils/Database/PrismaDatabase';
import z from 'zod';

export const getSessionsHandler: RequestHandler = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const userID = z.string().min(1).parse(res.locals.userId);
  const sessionID = z.string().min(1).parse(res.locals.sessionId);
  const sessions = await PrismaDatabase.session.findSessionsByUserId(userID);
  appAssert(sessions.length > 0, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  const sessionsWithCurrent = sessions.map((session) => ({
    ...session,
    isCurrent: session.id === sessionID,
  }));
  res.status(HttpErrors.OK).json({ sessions: sessionsWithCurrent });
});

export const deleteSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const sessionId = z.string().min(1).parse(req.body.id);
  const sessionDeleted = await PrismaDatabase.session.findByIdAndDelete(sessionId);
  appAssert(sessionDeleted, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_SESSION_DELETED });
});
