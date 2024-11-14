import { RequestHandler } from "express";
import appAssert from "../utils/helpers/appAssert";
import { UNAUTHORIZED } from "../utils/constants/http";
import { AppErrorCode } from "../utils/helpers/appError";
import { JWT } from "../utils/helpers/Jwt";

export const authenticator: RequestHandler = (req, res, next) => {
  // const accessToken = req.cookies.accessToken as string | undefined;
  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6eyJzZXNzaW9uSWQiOiI2NzMzYTRjMTliNWQ2MTIyMmFiYWVhNjYiLCJ1c2VySWQiOiI2NzJhNjA3OTA2MWY2OWViM2MxNTg0YTUifSwiaWF0IjoxNzMxNDM3NzYxLCJleHAiOjE3MzE0Mzg2NjEsImF1ZCI6WyJVc2VyIl19.xLP4a4tAaOEw1Cy9hdxsfM1eNrbQasJZHbWOHRFOwvQ";
  appAssert(accessToken, UNAUTHORIZED, "Not authorized", AppErrorCode.InvalidAccessToken);
  const payload = JWT.validateAccessToken(accessToken);
  console.log(payload);
  res.locals.userId = payload.userId;
  res.locals.sessionId = payload.sessionId;
  next();
};
