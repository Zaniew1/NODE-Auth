import { Response, ErrorRequestHandler } from "express";
import { z } from "zod";
import AppError from "../utils/helpers/appError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/constants/http";
import CookieClass, { REFRESH_PATH } from "../utils/helpers/cookies";
// catches zod errors
const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({
    errors,
    message: error.message,
  });
};
// catches new AppError()
const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

// main error handler, handles all zod errors while validation of data from frontend, and from our custom errors - created thanks to new AppError()
const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.path === REFRESH_PATH) {
    CookieClass.clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).send("Internal server error");
};

export default errorHandler;
