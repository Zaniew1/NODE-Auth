import { Response } from "express";
import { z } from "zod";
import errorHandler, { handleZodError, handleAppError } from "./errorHandler"; // Adjust the import path
import AppError from "../utils/helpers/appError"; // Adjust the import path
import { HttpErrors } from "../utils/constants/http";
import { Message } from "../utils/constants/messages";
import { REFRESH_PATH } from "../utils/helpers/cookies";
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  return res as Response;
};
describe("errorHandler file test suite", () => {
  describe("handleZodError function test suite", () => {
    it("should format ZodError issues and return 400 status code", () => {
      const res = mockResponse();
      const error = new z.ZodError([
        {
          path: ["field"],
          message: "Field is required",
          code: "invalid_type",
          expected: "string",
          received: "undefined",
        },
      ]);

      handleZodError(res, error);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ path: "field", message: "Field is required" }],
        message: error.message,
      });
    });
    it("should format ZodError issues, return status Code and give Invalid input data ", () => {
      const res = mockResponse();
      const error = new z.ZodError([
        {
          path: ["field"],
          message: "",
          code: "invalid_type",
          expected: "string",
          received: "undefined",
        },
      ]);

      handleZodError(res, error);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ path: "field", message: "Invalid input data" }],
        message: error.message,
      });
    });
  });
  describe("handleAppError function test suite", () => {
    it("should return statusCode, message, and errorCode from AppError", () => {
      const res = mockResponse();
      const error = new AppError(HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_INTERNAL_SERVER_ERROR);

      handleAppError(res, error);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: Message.FAIL_INTERNAL_SERVER_ERROR });
    });
  });
  describe("errorHandler function test suite", () => {
    const CookieClass = { clearAuthCookies: jest.fn() };

    it("should handle ZodError", () => {
      const req = { path: "/some-path" } as any;
      const res = mockResponse();
      const next = jest.fn();
      const error = new z.ZodError([
        {
          path: ["field"],
          message: "Field is required",
          code: "invalid_type",
          expected: "string",
          received: "undefined",
        },
      ]);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ path: "field", message: "Field is required" }],
        message: error.message,
      });
    });

    it("should handle AppError", () => {
      const req = { path: "/some-path" } as any;
      const res = mockResponse();
      const next = jest.fn();
      const error = new AppError(HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_INTERNAL_SERVER_ERROR);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: Message.FAIL_INTERNAL_SERVER_ERROR,
      });
    });

    it("should clear cookies if path matches REFRESH_PATH", () => {
      const req = { path: REFRESH_PATH } as any;
      const res = mockResponse();
      const next = jest.fn();
      const error = new AppError(HttpErrors.INTERNAL_SERVER_ERROR, Message.FAIL_INTERNAL_SERVER_ERROR);

      jest.spyOn(CookieClass, "clearAuthCookies").mockReturnValue((res: any) => {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken", { path: REFRESH_PATH });
      });

      errorHandler(error, req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { path: REFRESH_PATH });
      expect(res.status).toHaveBeenCalledWith(HttpErrors.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: Message.FAIL_INTERNAL_SERVER_ERROR,
      });
    });

    it("should handle unknown errors with 500 status code", () => {
      const req = { path: "/some-path" } as any;
      const res = mockResponse();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(HttpErrors.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(Message.FAIL_INTERNAL_SERVER_ERROR);
    });
  });
});
