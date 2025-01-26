import { JWT } from '../../utils/helpers/Jwt';
import { SessionDocument } from '../../session/model/session.model';
import * as allDates from '../../utils/helpers/date';
import { refreshAccessTokenUserService } from './auth.service';
import mongoose from 'mongoose';
import DatabaseClass from '../../utils/Database/Database';
const mocksessionId = new mongoose.Types.ObjectId('123456789123456789123456');
const mockuserId = new mongoose.Types.ObjectId('123456789123456789123453');
const a = new mongoose.Types.ObjectId('123456789123456789123452');
const underOneDay = new Date(Date.now() + 0.8 * (24 * 60 * 60 * 1000));
const updatedDate = new Date(Date.now() + 29 * (24 * 60 * 60 * 1000));
describe('authService test suite', () => {
  describe('refreshAccessTokenUserService function test suite', () => {
    it("Should refresh user's refresh token if expire date is shorter than 1 day", async () => {
      const mockSession = {
        _id: mocksessionId,
        userId: mockuserId,
        expiresAt: underOneDay, // Expires in UNDER one day
        save: jest.fn(), // Mock the save function
      } as Partial<SessionDocument> as SessionDocument;
      const mockSessionUpdated = {
        _id: mocksessionId,
        userId: mockuserId,
        expiresAt: updatedDate, // Expires in UNDER one day
        save: jest.fn(), // Mock the save function
      } as Partial<SessionDocument> as SessionDocument;
      const findBy = jest.spyOn(DatabaseClass.session, 'findById').mockResolvedValueOnce(mockSession);
      const findAndUpdate = jest.spyOn(DatabaseClass.session, 'findByIdAndUpdate').mockResolvedValueOnce(mockSessionUpdated);
      const validateRefresh = jest.spyOn(JWT, 'validateRefreshToken').mockReturnValueOnce({
        sessionId: a,
      });
      jest.spyOn(JWT, 'signRefreshToken').mockReturnValueOnce('345');
      jest.spyOn(JWT, 'signAccessToken').mockReturnValueOnce('123');
      const refreshToken = '123123123123';
      const thirtyDays = jest.spyOn(allDates, 'thirtyDaysFromNow').mockReturnValue(underOneDay);
      await refreshAccessTokenUserService(refreshToken);
      const now = Date.now();
      expect(mockSession.expiresAt.getTime() - now <= allDates.ONE_DAY_MS).toBe(true);
      expect(thirtyDays).toHaveBeenCalled();
      expect(validateRefresh).toHaveBeenCalled();
      expect(findBy).toHaveBeenCalled();
      expect(findAndUpdate).toHaveBeenCalled();
    });
    it("Shouldn't refresh user's refresh token if expire date is longer than 1 day", async () => {
      const mockSession = {
        _id: mocksessionId,
        userId: mockuserId,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expires in OVER one day
        save: jest.fn(), // Mock the save function
      } as Partial<SessionDocument> as SessionDocument;
      jest.spyOn(DatabaseClass.session, 'findById').mockResolvedValueOnce(mockSession);
      jest.spyOn(JWT, 'validateRefreshToken').mockReturnValueOnce({
        sessionId: mocksessionId,
      });
      const refreshToken = '123123123123';
      jest.spyOn(allDates, 'thirtyDaysFromNow').mockReturnValue(new Date(Date.now() + 0.8 * (24 * 60 * 60 * 1000)));
      await refreshAccessTokenUserService(refreshToken);
      const now = Date.now();
      expect(mockSession.expiresAt.getTime() - now <= allDates.ONE_DAY_MS).toBe(false);
      expect(mockSession.save).not.toHaveBeenCalled();
    });
  });
});
