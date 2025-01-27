import { RequestHandler, Response, Request, NextFunction } from 'express';
import appAssert from '../utils/helpers/appAssert';
import { HttpErrors } from '../utils/constants/http';
import { AppErrorCode } from '../utils/helpers/appError';
import { JWT } from '../utils/helpers/Jwt';
import { Message } from '../utils/constants/messages';

/**
 * This middleware is run when some rout is protected.
 * It validates user, based on accessToken cookie.
 * If is valid then assign userId and sessionId to res.locals
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const authenticator: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  // const accessToken =
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzkxMjZiYTQzMWFjNDIyNDRlZTYwOGEiLCJ1c2VySWQiOiI2NzkxMjZiYTQzMWFjNDIyNDRlZTYwODYiLCJpYXQiOjE3Mzc1NjU4ODMsImV4cCI6MTczNzU2Njc4MywiYXVkIjpbIlVzZXIiXX0.rMosibWIZm6ReoSu8HaXBH_bfrlZTCoXtqNGeOxGdJo";
  appAssert(typeof accessToken === 'string', HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
  const payload = JWT.validateAccessToken(accessToken);
  res.locals.userId = payload.userId;
  res.locals.sessionId = payload.sessionId;
  next();
};
