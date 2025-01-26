import { HttpErrors } from '../../utils/constants/http';
import appAssert from '../../utils/helpers/appAssert';
import catchAsync from '../../utils/helpers/catchAsync';
import { Message } from '../../utils/constants/messages';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { objectIdSchema } from '../../auth/zodSchemas/ObjectIdSchema';
import DatabaseClass from '../../utils/Database/Database';
import { SessionDocument } from '../model/session.model';
export const getSessionHandler: RequestHandler = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const sessionID = objectIdSchema.parse(res.locals.sessionId);
  const sessions = await DatabaseClass.session.findSessionsByUserId(userID);
  appAssert(sessions.length > 0, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  // set isCurrent key for current session
  const sessionsAndCurrentSession: SessionDocument[] = [];
  sessions.forEach((session) => {
    if (session._id == sessionID) {
      sessionsAndCurrentSession.push({ ...session.toObject(), isCurrent: true });
    } else {
      sessionsAndCurrentSession.push(session);
    }
  });
  res.status(HttpErrors.OK).json({ sessions: sessionsAndCurrentSession });
});
export const deleteSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const sessionId = objectIdSchema.parse(req.body.id);
  const sessionDeleted = await DatabaseClass.session.findByIdAndDelete(sessionId);
  appAssert(sessionDeleted, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_SESSION_DELETED });
});
