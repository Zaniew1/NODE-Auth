import { RequestHandler } from "express";
import appAssert from "../utils/helpers/appAssert";
import { UNAUTHORIZED } from "../utils/constants/http";
import { AppErrorCode } from "../utils/helpers/appError";
import { JWT } from "../utils/helpers/Jwt";

export const authenticator: RequestHandler = (req, res, next) => {
  // const accessToken = req.cookies.accessToken as string | undefined;
  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzM2MzE4NTZiYjVkYjFlZDIxYTQwYjYiLCJ1c2VySWQiOiI2NzJhNjA3OTA2MWY2OWViM2MxNTg0YTUiLCJpYXQiOjE3MzE2MDQ4NjksImV4cCI6MTczMTYwNTc2OSwiYXVkIjpbIlVzZXIiXX0.7W2EwFxZyCnwtISfseor2J8AIOqJb0yUMoQZXdt-TgY";
  appAssert(accessToken, UNAUTHORIZED, "Not authorized", AppErrorCode.InvalidAccessToken);
  const payload = JWT.validateAccessToken(accessToken);
  res.locals.userId = payload.userId;
  res.locals.sessionId = payload.sessionId;
  next();
};
