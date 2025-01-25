import { getUserHandler, deleteUserHandler } from "./userController";
import z from "zod";
import { Message } from "../../utils/constants/messages";
import { HttpErrors } from "../../utils/constants/http";
import { AssertionError } from "node:assert";
import UserModel, { UserDocument } from "../model/user.model";
import { NextFunction, Request, Response } from "express";
import DatabaseClass from "../../utils/Database/Database";
import mongoose from "mongoose";
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
const mockId = new mongoose.Types.ObjectId("123456789123456789123456");
const userMock = {
  _id: mockId,
  email: "m.zaniewski19915@gmail.com",
  password: "$2a$10$YGGAb.ToDUNpqGIH.0K8nOCYAa/quCZPm536zeOIrcWXkLGeSarmS",
  verified: true,
  createdAt: new Date(1),
  updatedAt: new Date(1),
} as Partial<UserDocument> as UserDocument;
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
      jest.spyOn(DatabaseClass.user, "findById").mockResolvedValue(null);
      await getUserHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should return user if success", async () => {
      const resMock = mockResponse() as Response;
      const reqMock = mockRequest() as Request;
      resMock.locals.userId = "672b50c01df576319309286e";
      jest.spyOn(DatabaseClass.user, "findById").mockResolvedValue(userMock);
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
