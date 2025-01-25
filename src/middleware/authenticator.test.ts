import { JWT } from "../utils/helpers/Jwt";
import { Request, Response, NextFunction } from "express";
import { AssertionError } from "node:assert";
import { authenticator } from "./authenticator";
import mongoose from "mongoose";

const tokenValidAccessToken = "12312aoluihdiasdijasidasdjnasoindoasn3";
const mockObjectId = new mongoose.Types.ObjectId("123456789123456789123456");
const mocksessionId = new mongoose.Types.ObjectId("123456789123456789123456");

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
    jest.spyOn(JWT, "validateAccessToken").mockReturnValueOnce({ userId: mockObjectId, sessionId: mocksessionId });
    await authenticator(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.locals.userId).toBe(mockObjectId);
    expect(res.locals.sessionId).toBe(mocksessionId);
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
