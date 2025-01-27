import assert from 'node:assert';
import AppError, { AppErrorCode } from './appError';
import { HttpStatusCode } from '../constants/http';

export type AppAssert = (condition: any, httpStatusCode: HttpStatusCode, message: string, appErrorCode?: AppErrorCode) => asserts condition;

//
/**
 * Function implements assert function with new AppError() - it makes errorHandling a lot easier
 *
 * @param {*} condition
 * @param {HttpStatusCode} httpStatusCode
 * @param {string} message
 * @param {?AppErrorCode} [appErrorCode]
 */
const appAssert: AppAssert = (condition, httpStatusCode, message, appErrorCode?) => {
  assert(condition, new AppError(httpStatusCode, message, appErrorCode));
};
export default appAssert;
