import { getSessionsHandler, deleteSessionHandler } from './sessionController';
import SessionModel, { SessionDocument } from '../model/session.model';
import { NextFunction, Response, Request } from 'express';
import { HttpErrors } from '../../utils/constants/http';
import { Message } from '../../utils/constants/messages';
import z from 'zod';
import { AssertionError } from 'node:assert';
import mongoose from 'mongoose';
import DatabaseClass from '../../utils/Database/Database';
const mockUserId = new mongoose.Types.ObjectId('123456789123456789123456');
const mockSessionId = new mongoose.Types.ObjectId('123456789123456789123455');
const mockRequest = (): Partial<Request> => {
  return {
    body: null,
  };
};
const mockResponse = (): Partial<Response> => {
  return {
    cookie: jest.fn(),
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};
const mockNext: NextFunction = jest.fn();
const sessionMock = {
  _id: mockSessionId,
  userId: mockUserId,
  userAgent: 'MockAgent',
  createdAt: '2024-11-04T17:59:45.493+00:00',
  expiresAt: '2024-12-04T17:59:45.493+00:00',
};
describe('sessionController test suite', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  describe('getSessionsHandler test suite', () => {
    it('Should return error if sessions are not found', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      resMock.locals.userId = '67290b913991ecf85c227fb9';
      resMock.locals.sessionId = '67290b913991ecf85c227fb9';
      jest.spyOn(SessionModel, 'find').mockResolvedValue([]);
      await getSessionsHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should return error if there is no sessionId or userId', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      resMock.locals.userId = null;
      resMock.locals.sessionId = null;
      jest.spyOn(SessionModel, 'find').mockResolvedValue([]);
      await getSessionsHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should find all sessions in database by userId', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      const mockNext: NextFunction = jest.fn();
      resMock.locals.userId = '67290b913991ecf85c227fb9';
      resMock.locals.sessionId = '67290b913991ecf85c227fb9';
      const sessionMock = {
        _id: new mongoose.Types.ObjectId(resMock.locals.sessionId),
        userId: new mongoose.Types.ObjectId(resMock.locals.userId),
        userAgent: 'MockAgent',
        createdAt: new Date(0),
        expiresAt: new Date(0),
        isCurrent: true,
      } as Partial<SessionDocument> as SessionDocument;
      const sessionMock2 = {
        _id: new mongoose.Types.ObjectId(resMock.locals.sessionId),
        userId: new mongoose.Types.ObjectId(resMock.locals.userId),
        userAgent: 'MockAgent',
        createdAt: new Date(1),
        expiresAt: new Date(1),
      } as Partial<SessionDocument> as SessionDocument;
      const current = { isCurrent: true };
      let findSpy: jest.SpyInstance = jest.spyOn(DatabaseClass.session, 'findSessionsByUserId').mockResolvedValueOnce([sessionMock, sessionMock2]);

      await getSessionsHandler(reqMock, resMock, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith(sessionMock.userId);
      expect(resMock.locals.userId).toBeDefined();
      expect(resMock.locals.userId).toBe('67290b913991ecf85c227fb9');
      expect(resMock.locals.sessionId).toBeDefined();
      expect(resMock.locals.sessionId).toBe('67290b913991ecf85c227fb9');
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({
        sessions: [{ ...current, ...sessionMock }, sessionMock2],
      });
    });
  });
  describe('deleteSessionHandler test suite', () => {
    it('Should throw zod error if no sessionId', async () => {
      const reqMock = mockRequest() as Request;
      const resMock = mockResponse() as Response;
      reqMock.body = { id: '123' };
      await deleteSessionHandler(reqMock, resMock, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(z.ZodError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should return error if there was no such session in db', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = { id: '67290b913991ecf85c227fb9' };
      const resMock = mockResponse() as Response;
      resMock.locals.userId = '67290b913991ecf85c227fb5';
      jest.spyOn(SessionModel, 'findOneAndDelete').mockResolvedValue(null);

      await deleteSessionHandler(reqMock, resMock, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AssertionError));
      expect(resMock.status).not.toHaveBeenCalled();
      expect(resMock.json).not.toHaveBeenCalled();
    });
    it('Should delete one session', async () => {
      const reqMock = mockRequest() as Request;
      reqMock.body = { id: '67290b913991ecf85c227fb9' };
      const resMock = mockResponse() as Response;
      resMock.locals.userId = '67290b913991ecf85c227fb5';
      jest.spyOn(SessionModel, 'findOneAndDelete').mockResolvedValue(sessionMock);
      await deleteSessionHandler(reqMock, resMock, mockNext);
      expect(reqMock.body.id).toBeDefined();
      expect(resMock.locals.userId).toBeDefined();
      expect(resMock.locals.userId).toBe('67290b913991ecf85c227fb5');
      expect(reqMock.body.id).toBe('67290b913991ecf85c227fb9');
      expect(resMock.status).toHaveBeenCalledWith(HttpErrors.OK);
      expect(resMock.json).toHaveBeenCalledWith({ message: Message.SUCCESS_SESSION_DELETED });
    });
  });
});
