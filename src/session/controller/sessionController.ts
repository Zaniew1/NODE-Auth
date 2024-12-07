import SessionModel from "../model/session.model";
import { HttpErrors } from "../../utils/constants/http";
import appAssert from "../../utils/helpers/appAssert";
import catchAsync from "../../utils/helpers/catchAsync";
import { Message } from "../../utils/constants/messages";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { objectIdSchema } from "../../auth/zodSchemas/ObjectIdSchema";

export const getSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userID = objectIdSchema.parse(res.locals.userId);
  const sessionID = objectIdSchema.parse(res.locals.sessionId);

  const sessions = await SessionModel.find(
    {
      userId: userID,
      expiresAt: { $gt: new Date() },
    },
    {
      _id: 1,
      userAgent: 1,
      createdAt: 1,
    },
    {
      sort: { createdAt: -1 },
    }
  );
  appAssert(sessions.length > 0, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  // set isCurrent key for current session

  const sessionsAndCurrentSession = sessions.map((session) => ({
    ...session,
    ...(session._id === sessionID && { isCurrent: true }),
  }));
  res.status(HttpErrors.OK).json({ sessions: sessionsAndCurrentSession });
});
export const deleteSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = objectIdSchema.parse(req.body.id);
  const sessionDeleted = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId: res.locals.userId,
  });
  appAssert(sessionDeleted, HttpErrors.NOT_FOUND, Message.FAIL_SESSION_NOT_FOUND);
  res.status(HttpErrors.OK).json({ message: Message.SUCCESS_SESSION_DELETED });
});
