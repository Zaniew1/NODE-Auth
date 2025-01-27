import { HttpStatusCode } from '../constants/http';

export const enum AppErrorCode {
  InvalidAccessToken = 'InvalidAccessToken',
}

/**
 * This class is used to showcase errors in a defined manner. This function forces to always give proper status code and a message.
 * This function is used in appAssert function.
 *
 * @class AppError
 * @typedef {AppError}
 * @extends {Error}
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError.
   *
   * @constructor
   * @param {HttpStatusCode} statusCode
   * @param {string} message
   * @param {?AppErrorCode} [errorCode]
   */
  constructor(public statusCode: HttpStatusCode, public message: string, public errorCode?: AppErrorCode) {
    super(message);
  }
}

export default AppError;
