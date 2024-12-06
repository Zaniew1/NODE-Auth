import { RequestHandler } from "express";
import appAssert from "../utils/helpers/appAssert";
import { HttpErrors } from "../utils/constants/http";
import { AppErrorCode } from "../utils/helpers/appError";
import { JWT } from "../utils/helpers/Jwt";
import { Message } from "../utils/constants/messages";

export const authenticator: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(accessToken, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
  const payload = JWT.validateAccessToken(accessToken);
  appAssert(payload, HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
  res.locals.userId = payload.userId;
  res.locals.sessionId = payload.sessionId;
  next();
};
