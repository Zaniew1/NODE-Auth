import { HttpStatusCode } from "../constants/http";

export const enum AppErrorCode {
  InvalidAccessToken = "InvalidAccessToken",
}

class AppError extends Error {
  constructor(public statusCode: HttpStatusCode, public message: string, public errorCode?: AppErrorCode) {
    super(message);
  }
}

export default AppError;
