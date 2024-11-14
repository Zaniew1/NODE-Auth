import { RequestHandler } from "express";
import appAssert from "../utils/helpers/appAssert";
import { UNAUTHORIZED } from "../utils/constants/http";
import { AppErrorCode } from "../utils/helpers/appError";
import { JWT } from "../utils/helpers/Jwt";

export const authenticator: RequestHandler = (req, res, next) => {
  // const accessToken = req.cookies.accessToken as string | undefined;
  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzM2MzkyMDg5NjAwZDc1MWYwZDE2NDQiLCJ1c2VySWQiOiI2NzM2MzkxOTg5NjAwZDc1MWYwZDE2M2QiLCJpYXQiOjE3MzE2MDY4MTYsImV4cCI6MTczMTYwNzcxNiwiYXVkIjpbIlVzZXIiXX0.URosMZ1Zmn52wMBxaY8WZcHRgiqI6uVmI-MFrYqLGM0";
  appAssert(accessToken, UNAUTHORIZED, "Not authorized", AppErrorCode.InvalidAccessToken);
  const payload = JWT.validateAccessToken(accessToken);
  res.locals.userId = payload.userId;
  res.locals.sessionId = payload.sessionId;
  next();
};
