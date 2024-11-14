import SessionModel from "../models/session.model";
import { NOT_FOUND, OK } from "../utils/constants/http";
import appAssert from "../utils/helpers/appAssert";
import catchAsync from "../utils/helpers/catchAsync";
import { RequestHandler, Request, Response, NextFunction } from "express";
import z from "zod";

export const getSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sessions = await SessionModel.find(
    {
      userId: res.locals.userId,
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
  appAssert(sessions, NOT_FOUND, "Sessions not found");
  // set isCurrent key for current session
  const sessionsAndCurrentSession = sessions.map((session) => ({
    ...session.toObject(),
    ...(session.id === res.locals.sessionId && { isCurrent: true }),
  }));
  res.status(OK).json({ sessions: sessionsAndCurrentSession });
});
export const deleteSessionHandler: RequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = z.string().parse(req.body.id);
  const sessionDeleted = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId: res.locals.userId,
  });
  appAssert(sessionDeleted, NOT_FOUND, "Session not found");
  res.status(OK).json({ message: "Session successfully deleted" });
});
