import assert from "node:assert";
import AppError, { AppErrorCode } from "./appError";
import { HttpStatusCode } from "../constants/http";

export type AppAssert = (condition: any, httpStatusCode: HttpStatusCode, message: string, appErrorCode?: AppErrorCode) => asserts condition;

// custom function to implement assert function with new AppError() - it makes errorHandling a lot easier
const appAssert: AppAssert = (condition, httpStatusCode, message, appErrorCode?) => {
  assert(condition, new AppError(httpStatusCode, message, appErrorCode));
};
export default appAssert;
