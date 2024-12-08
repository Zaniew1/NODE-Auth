import { JWT } from "../utils/helpers/Jwt";
import { Request, Response, NextFunction } from "express";
import { AssertionError } from "node:assert";
import { authenticator } from "./authenticator";
import { HttpErrors } from "../utils/constants/http";
import { Message } from "../utils/constants/messages";
import AppError, { AppErrorCode } from "../utils/helpers/appError";

const noAccessToken = undefined;
const tokenWrongAccessToken = "123123";
const tokenValidAccessToken = "12312aoluihdiasdijasidasdjnasoindoasn3";
const mockRequest = (): Partial<Request> => {
  return {
    cookies: jest.fn(),
  };
};
const mockResponse = (): Partial<Response> => {
  return {
    locals: {},
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};
const mockNext: NextFunction = jest.fn();

describe("authenticator middleware test suite", () => {
  afterEach(() => jest.restoreAllMocks());
  it("Should get proper accessToken", async () => {
    const req = mockRequest() as Request;
    const res = mockResponse() as Response;
    req.cookies.accessToken = tokenValidAccessToken;
    jest.spyOn(JWT, "validateAccessToken").mockReturnValueOnce({ userId: "123123", sessionId: "123123" });
    await authenticator(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.locals.userId).toBe("123123");
    expect(res.locals.sessionId).toBe("123123");
  });
  it("Should throw error if no token", async () => {
    const req = mockRequest() as Request;
    const res = mockResponse() as Response;
    req.cookies.accessToken = undefined;
    try {
      await authenticator(req, res, mockNext);
    } catch (err: any) {
      expect(err).toBeInstanceOf(AssertionError);
    }
  });
});
