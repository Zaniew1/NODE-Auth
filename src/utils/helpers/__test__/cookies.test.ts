import { Response } from "express";
import { REFRESH_PATH } from "../cookies";
import CookiesClass from "../cookies";
import * as DatesFunc from "../date";
const mockRes: Partial<Response> = {
  cookie: jest.fn().mockReturnThis(), // Mock the cookie method
  clearCookie: jest.fn().mockReturnThis(), // Mock clearCookie method as well (for clearAuthCookies)
};
const accessToken = "testAccessToken";
const refreshToken = "testRefreshToken";

describe("Cookie class test suite", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("setAuthCookies method test suite", () => {
    it("Should set accessToken cookie and refresToken cookie", async () => {
      jest.spyOn(CookiesClass, "getAccessTokenCookieOptions").mockReturnValueOnce({});
      jest.spyOn(CookiesClass, "getRefreshTokenCookieOptions").mockReturnValueOnce({});

      CookiesClass.setAuthCookies({ res: mockRes as Response, accessToken, refreshToken });

      expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", accessToken, {});
      expect(mockRes.cookie).toHaveBeenCalledWith("refreshToken", refreshToken, {});
    });
  });
  describe("clearAuthCookies method test suite", () => {
    it("Should clear accessToken cookie and refreshToken cookie", async () => {
      const res: Partial<Response> = {
        clearCookie: jest.fn().mockReturnThis(),
      };

      CookiesClass.clearAuthCookies(res as Response);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", { path: REFRESH_PATH });
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
  describe("getAccessTokenCookieOptions method test suite", () => {
    it("Should return access token options", async () => {
      jest.spyOn(DatesFunc, "fifteenMinutesFromNow").mockReturnValueOnce(new Date(1));

      const options = CookiesClass.getAccessTokenCookieOptions();

      expect(options).toEqual({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: new Date(1),
      });
    });
  });
  describe("getRefreshTokenCookieOptions method test suite", () => {
    it("Should return refresh token options", async () => {
      jest.spyOn(DatesFunc, "thirtyDaysFromNow").mockReturnValueOnce(new Date(1));

      const options = CookiesClass.getRefreshTokenCookieOptions();

      expect(options).toEqual({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: new Date(1),
        path: REFRESH_PATH,
      });
    });
  });
});
