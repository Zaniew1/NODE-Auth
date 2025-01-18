import { JWT } from "../../utils/helpers/Jwt";
import SessionModel from "../../session/model/session.model";
import * as allDates from "../../utils/helpers/date";
import { refreshAccessTokenUserService } from "./auth.service";
describe("authService test suite", () => {
  describe("refreshAccessTokenUserService function test suite", () => {
    it("Should refresh user's refresh token if expire date is shorter than 1 day", async () => {
      const mockSession = {
        _id: "mock-session-id",
        userId: "mock-user-id",
        expiresAt: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000), // Expires in UNDER one day
        save: jest.fn(), // Mock the save function
      };
      jest.spyOn(SessionModel, "findById").mockResolvedValueOnce(mockSession);
      jest.spyOn(JWT, "validateRefreshToken").mockReturnValueOnce({
        sessionId: "123123",
      });
      const refreshToken = "123123123123";
      const thirtyDays = jest.spyOn(allDates, "thirtyDaysFromNow").mockReturnValue(new Date(Date.now() + 0.8 * (24 * 60 * 60 * 1000)));
      await refreshAccessTokenUserService(refreshToken);
      const now = Date.now();
      expect(mockSession.expiresAt.getTime() - now <= allDates.ONE_DAY_MS).toBe(true);
      expect(thirtyDays).toHaveBeenCalled();
      expect(mockSession.save).toHaveBeenCalled();
    });
    it("Shouldn't refresh user's refresh token if expire date is longer than 1 day", async () => {
      const mockSession = {
        _id: "mock-session-id",
        userId: "mock-user-id",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expires in OVER one day
        save: jest.fn(), // Mock the save function
      };
      jest.spyOn(SessionModel, "findById").mockResolvedValueOnce(mockSession);
      jest.spyOn(JWT, "validateRefreshToken").mockReturnValueOnce({
        sessionId: "123123",
      });
      const refreshToken = "123123123123";
      const thirtyDays = jest.spyOn(allDates, "thirtyDaysFromNow").mockReturnValue(new Date(Date.now() + 0.8 * (24 * 60 * 60 * 1000)));
      await refreshAccessTokenUserService(refreshToken);
      const now = Date.now();
      expect(mockSession.expiresAt.getTime() - now <= allDates.ONE_DAY_MS).toBe(false);
      expect(mockSession.save).not.toHaveBeenCalled();
    });
  });
});
