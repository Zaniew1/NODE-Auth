import AppError, { AppErrorCode } from "../appError";
import { HttpErrors } from "../../constants/http";
import { Message } from "../../constants/messages";
describe("appError function test suite", () => {
  it("Should throw error", async () => {
    const httpStatusCode = HttpErrors.NOT_FOUND;
    const message = Message.FAIL_INTERNAL_SERVER_ERROR;
    const errorCode = AppErrorCode.InvalidAccessToken;
    const errorInstance = new AppError(httpStatusCode, message, errorCode);
    expect(errorInstance).toBeInstanceOf(AppError);
    expect(errorInstance.statusCode).toBe(httpStatusCode);
    expect(errorInstance.message).toBe(message);
    expect(errorInstance.errorCode).toBe(errorCode);
  });
});
