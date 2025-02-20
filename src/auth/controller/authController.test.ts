import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  verifyEmailHandler,
  forgotPasswordHandler,
  changePasswordHandler,
} from './authController';
import * as authService from '../service/auth.service';
import { Request, Response, NextFunction } from 'express';
import { Message } from '../../utils/constants/messages';
import CookiesClass from '../../utils/helpers/cookies';
import { HttpErrors } from '../../utils/constants/http';
import z, { ZodError } from 'zod';
import { AssertionError } from 'node:assert';
import { JWT } from '../../utils/helpers/Jwt';
import mongoose from 'mongoose';
import DatabaseClass from '../../utils/Database/Database';

const mockObjectId = new mongoose.Types.ObjectId('123456789123456789123456');
const mocksessionId = new mongoose.Types.ObjectId('123456789123456789123456');

const mockRequest = (): Partial<Request> => {
  return {
    headers: {
      'user-agent': 'PostmanRuntime/7.39.1',
    },
    params: {},
    body: {},
    cookies: jest.fn(),
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

describe('authController test suite', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  describe('registerHandler function test suite', () => {
    it('Should register user', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      const mockUser = {
        name: 'Mateusz1',
        email: 'test1231231231@gmail.com',
        password: '111hashedPassword1@#',
        confirmPassword: '111hashedPassword1@#',
      };
      const mockReturnUser = {
        _id: 1,
        name: 'Mateusz1',
        email: 'test1231231231@gmail.com',
        password: '111hashedPassword1@#',
        confirmPassword: '111hashedPassword1@#',
      };
      reqMock.body = mockUser;
      let authServiceSpy: jest.SpyInstance = jest.spyOn(authService, 'createUserService');
      authServiceSpy.mockResolvedValueOnce({
        user: mockReturnUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      const mockSetAuthCookies = jest.spyOn(CookiesClass, 'setAuthCookies');
      mockSetAuthCookies.mockImplementation(({ res }) => res);
      await registerHandler(reqMock, resMock, mockNext);

      expect(mockSetAuthCookies).toHaveBeenCalledWith({
        res: resMock,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(resMock.json).toHaveBeenCalledWith({
        message: Message.SUCCESS_USER_CREATE,
        user: mockReturnUser,
      });
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.CREATED);
    });
    it('Should throw errror if invalid data', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = {};
      const resMock = mockResponse() as Response;

      await registerHandler(reqMock, resMock, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
  });
  describe('loginHandler function test suite', () => {
    it('Should login user', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = {
        email: 'test@test.pl',
        password: 'hashedPassword1@#',
      };
      const resMock = mockResponse() as Response;

      let functionSpy: jest.SpyInstance = jest.spyOn(authService, 'loginUserService');
      functionSpy.mockResolvedValueOnce({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const mockSetAuthCookies = jest.spyOn(CookiesClass, 'setAuthCookies');
      mockSetAuthCookies.mockImplementation(({ res }) => res);
      await loginHandler(reqMock, resMock, mockNext);

      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({
        message: Message.SUCCESS_USER_LOGIN,
      });
      expect(mockSetAuthCookies).toHaveBeenCalledWith({
        res: resMock,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
    it('Should throw error if data is invalid', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = {
        email: 'test12@test.com',
      };
      const resMock = mockResponse() as Response;

      await loginHandler(reqMock, resMock, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
  });
  ////////////////////////////////////////////////////////////////////////////////////
  describe('logoutHandler function test suite', () => {
    beforeAll(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
    it('Should logout user', async () => {
      const reqMock = mockRequest() as Request;
      const accessTokenMock =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTYiLCJ1c2VySWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTIiLCJpYXQiOjE3MzI1NTEwNDgsImV4cCI6MTczMjU1MTk0OCwiYXVkIjpbIlVzZXIiXX0.OGgHwwYygLVPGUZ3Dh2VxY9I1dXBWE6TKs_e-yk-PRo';
      reqMock.cookies.accessToken = accessTokenMock;
      const resMock = mockResponse() as Response;
      let jwtSpy: jest.SpyInstance = jest.spyOn(JWT, 'validateAccessToken');
      jwtSpy.mockReturnValueOnce({ userId: mockObjectId, sessionId: mocksessionId });
      const sessionSpy = jest.spyOn(DatabaseClass.session, 'findByIdAndDelete').mockResolvedValueOnce(null);
      const clearCookiesSpy = jest.spyOn(CookiesClass, 'clearAuthCookies').mockReturnValueOnce(resMock);
      await logoutHandler(reqMock, resMock, mockNext);
      expect(jwtSpy).toHaveBeenCalledWith(accessTokenMock);
      expect(sessionSpy).toHaveBeenCalledWith(mocksessionId);
      expect(clearCookiesSpy).toHaveBeenCalledWith(resMock);
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_USER_LOGOUT });
    });
    it('Should throw error if accessToken is invalid', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.cookies.accessToken = '';
      const resMock = mockResponse() as Response;
      await logoutHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
  });

  describe('forgotPasswordHandler function test suite', () => {
    it('Should throw an error if email is wrong', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      reqMock.body.email = '';
      jest.spyOn(authService, 'forgotPasswordService').mockResolvedValueOnce({ url: '123' });
      await forgotPasswordHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should return success message after sending email with verification code ', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      reqMock.body.email = 'test123@gmail.com';
      jest.spyOn(authService, 'forgotPasswordService').mockResolvedValueOnce({ url: '123' });
      await forgotPasswordHandler(reqMock, resMock, mockNext);
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_USER_FORGET_PASSWORD });
    });
  });

  describe('verifyEmailHandler function test suite', () => {
    it('Should throw an error if verificationCode is wrong', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      reqMock.params.code = '';
      await verifyEmailHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should verify user', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      const verifyCode = '123123123123';
      reqMock.params.code = verifyCode;
      const mockUser = {
        _id: mockObjectId,
        email: 'm.zaniewski19915@gmail.com',
        verified: true,
        createdAt: new Date('2024-11-06T11:19:28.526+00:00'),
        updatedAt: new Date('2024-11-06T11:19:28.526+00:00'),
        __v: 0,
      };
      const verifyService = jest.spyOn(authService, 'verifyUserEmailService').mockResolvedValueOnce({ user: mockUser });

      await verifyEmailHandler(reqMock, resMock, mockNext);
      expect(verifyService).toHaveBeenCalledWith(verifyCode);

      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_USER_VERIFIED_MAIL });
    });
  });

  describe('changePasswordHandler function test suite', () => {
    it('Should throw error if there is wrong verification code or password ', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      reqMock.body.password = '';
      reqMock.body.verificationCode = '';
      await changePasswordHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it("Should change user's password", async () => {
      const reqMock = mockRequest() as Request;
      const passMock = 'mockPassword1@#';
      const verCodeMock = '123123123';
      reqMock.body.password = passMock;
      reqMock.body.verificationCode = verCodeMock;
      const mockUser = {
        _id: mockObjectId,
        email: 'm.zaniewski19915@gmail.com',
        verified: true,
        createdAt: new Date('2024-11-06T11:19:28.526+00:00'),
        updatedAt: new Date('2024-11-06T11:19:28.526+00:00'),
        __v: 0,
      };
      const resMock = mockResponse() as Response;
      const changePassSpy = jest.spyOn(authService, 'changePasswordService').mockResolvedValueOnce({ user: mockUser });
      const clearCookiesSpy = jest.spyOn(CookiesClass, 'clearAuthCookies').mockReturnValueOnce(resMock);
      await changePasswordHandler(reqMock, resMock, mockNext);
      expect(changePassSpy).toHaveBeenCalledWith(reqMock.body);
      expect(clearCookiesSpy).toHaveBeenCalledWith(resMock);
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_USER_CHANGED_PASSWORD });
    });
  });
  describe('refreshHandler function test suite', () => {
    it('Should throw UNAUTHORIZED error if no refreshToken', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.cookies = {};
      const resMock = mockResponse() as Response;
      const nextMock = jest.fn();

      await refreshHandler(reqMock, resMock, nextMock);
      const error = nextMock.mock.calls[0][0];
      expect(nextMock).toHaveBeenCalled();
      expect(error).toBeInstanceOf(AssertionError);
    });
    it('Should reset refresh token and accessToken', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.cookies.refreshToken = 'mockRefreshToken';
      const resMock = {
        status: jest.fn().mockReturnThis(), // For chaining
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const nextMock = jest.fn();
      jest
        .spyOn(authService, 'refreshAccessTokenUserService')
        .mockResolvedValueOnce({ accessToken: 'mockNewAccessToken', newRefreshToken: 'mockNewRefreshToken' });
      jest.spyOn(CookiesClass, 'getRefreshTokenCookieOptions').mockReturnValue({});
      jest.spyOn(CookiesClass, 'getAccessTokenCookieOptions').mockReturnValue({});
      await refreshHandler(reqMock, resMock, nextMock);
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({
        message: Message.SUCCESS_USER_REFRESHED_TOKEN,
      });

      expect(resMock.cookie).toHaveBeenCalledWith('refreshToken', 'mockNewRefreshToken', {});
      expect(resMock.cookie).toHaveBeenCalledWith('accessToken', 'mockNewAccessToken', {});
      expect(nextMock).not.toHaveBeenCalled();
    });
  });
});
