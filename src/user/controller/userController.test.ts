import { getUserHandler, deleteUserHandler } from "./userController";
import z from "zod";
import { Message } from "../../utils/constants/messages";
import { HttpErrors } from "../../utils/constants/http";
import { AssertionError } from "node:assert";
import UserModel from "../model/user.model";
import { NextFunction, Request, Response } from "express";
const mockRequest = (): Partial<Request> => {
  return {};
};
const mockResponse = (): Partial<Response> => {
  return {
    cookie: jest.fn(),
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
};
const mockNext: NextFunction = jest.fn();
const userMock = {
  _id: "672b50c01df576319309286e",
  email: "m.zaniewski19915@gmail.com",
  password: "$2a$10$YGGAb.ToDUNpqGIH.0K8nOCYAa/quCZPm536zeOIrcWXkLGeSarmS",
  verified: true,
  createdAt: "2024-11-06T11:19:28.526+00:00",
  updatedAt: "2024-11-07T18:11:25.846+00:00",
  __v: "",
};
describe("userController test suite", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getUserHandler test suite", () => {
    it("Should throw errror if userId is wrong", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "123";
      await getUserHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should throw error if there is no user", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "672b50c01df576319309286e";
      jest.spyOn(UserModel, "findById").mockResolvedValue(null);
      await getUserHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should return user if success", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "672b50c01df576319309286e";
      jest.spyOn(UserModel, "findById").mockResolvedValue(userMock);
      await getUserHandler(reqMock, resMock, mockNext);
      expect(resMock.locals.userId).toBeDefined();
      expect(resMock.locals.userId).toBe("672b50c01df576319309286e");
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
    });
  });
  describe("deleteUserHandler test suite", () => {
    it("Should throw errror if userId is wrong", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "123";
      await deleteUserHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should throw error if there is no user", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "672b50c01df576319309286e";
      jest.spyOn(UserModel, "findByIdAndDelete").mockResolvedValue(null);
      await deleteUserHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should return ok if succesfully deleted user", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "672b50c01df576319309286e";
      jest.spyOn(UserModel, "findByIdAndDelete").mockResolvedValue(userMock);
      await deleteUserHandler(reqMock, resMock, mockNext);
      expect(resMock.locals.userId).toBeDefined();
      expect(resMock.locals.userId).toBe("672b50c01df576319309286e");
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_USER_DELETED });
    });
  });
});
