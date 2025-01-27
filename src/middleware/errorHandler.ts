import { Response, ErrorRequestHandler, Request, NextFunction } from 'express';
import { z } from 'zod';
import AppError from '../utils/helpers/appError';
import { HttpErrors } from '../utils/constants/http';
import CookieClass, { REFRESH_PATH } from '../utils/helpers/cookies';
import { Message } from '../utils/constants/messages';

/**
 * This middleware catches zod errors
 *
 * @param {Response} res
 * @param {z.ZodError} error
 * @returns {*}
 */
export const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message || 'Invalid input data',
  }));

  return res.status(HttpErrors.BAD_REQUEST).json({
    errors,
    message: error.message,
  });
};
/**
 * This middleware catches new AppError()
 *
 * @param {Response} res
 * @param {AppError} error
 * @returns {*}
 */
export const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

/**
 * Main error handler, handles all zod errors while validation of data from frontend,
 * and from our custom errors - created thanks to new AppError()
 *
 * @param {z.ZodError | AppError | any} error
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} _next
 */
export const errorHandler: ErrorRequestHandler = (error: z.ZodError | AppError | any, req: Request, res: Response, _next: NextFunction) => {
  if (req.path === REFRESH_PATH) {
    CookieClass.clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
  }

  res.status(HttpErrors.INTERNAL_SERVER_ERROR).send(Message.FAIL_INTERNAL_SERVER_ERROR);
};

export default errorHandler;
