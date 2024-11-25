import { registerHandler } from "./authController";
import * as authService from "../service/auth.service";
import { Request, Response, NextFunction } from "express";
import { Message } from "../../utils/constants/messages";
import CookiesClass from "../../utils/helpers/cookies";
import { HttpErrors } from "../../utils/constants/http";
import z from "zod";
const mockRequest = (): Partial<Request> => {
  return {
    headers: {
      "user-agent": "PostmanRuntime/7.39.1",
    },
    body: {
      name: "Mateusz1",
      email: "m.zaniewski1995@gmail.com",
      password: "Dragonborn1@#",
      confirmPassword: "Dragonborn1@#",
    },
  };
};
const mockResponse = (): Partial<Response> => {
  return {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};
const mockNext: NextFunction = jest.fn();

describe("authController test suite", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  describe("registerHandler function test suite", () => {
    it("Should register user", async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      const mockUser = {
        _id: "id",
        name: "Mateusz1",
        email: "m.zaniewski1995@gmail.com",
        password: "hashedPassword",
      };
      let functionSpy: jest.SpyInstance = jest.spyOn(authService, "createUserService");
      functionSpy.mockResolvedValueOnce({
        user: mockUser,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });

      const mockSetAuthCookies = jest.spyOn(CookiesClass, "setAuthCookies");
      mockSetAuthCookies.mockImplementation(({ res }) => res);
      await registerHandler(reqMock, resMock, mockNext);

      expect(mockSetAuthCookies).toHaveBeenCalledWith({
        res: resMock,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });
      expect(resMock.json).toHaveBeenCalledWith({
        message: Message.SUCCESS_USER_CREATE,
        user: mockUser,
      });
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.CREATED);
    });
    it("Should throw errror if invalid data", async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = {};
      const resMock = mockResponse() as Response;

      await registerHandler(reqMock, resMock, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
  });
  // describe("loginHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("logoutHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("refreshHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("forgetPasswordHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("verifyEmailHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("forgotPasswordHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
  // describe("changePasswordHandler function test suite", () => {
  //   it("Should get proper userId", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
});
