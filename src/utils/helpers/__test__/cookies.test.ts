import { Response } from "express";
import { AuthCookieParams, REFRESH_PATH } from "../cookies";
import CookiesClass from "../cookies";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "../date";
const mockCookie = jest.fn();
const mockResponse = (): Partial<Response> => {
  return {
    clearCookie: jest.fn(),
  };
};
const accessToken = "testAccessToken";
const refreshToken = "testRefreshToken";
jest.mock("../cookies");
const mockFifteenMinutesFromNow = jest.fn(() => new Date(Date.now() + 15 * 60 * 1000));
const mockThirtyDaysFromNow = jest.fn(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
describe("Cookie class test suite", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    (CookiesClass.getAccessTokenCookieOptions as jest.Mock).mockReset();
    (CookiesClass.getRefreshTokenCookieOptions as jest.Mock).mockReset();
  });
  describe("setAuthCookies method test suite", () => {
    it.skip("Should set accessToken cookie and refresToken cookie", async () => {
      const mockRes = mockResponse();
      (CookiesClass.getAccessTokenCookieOptions as jest.Mock).mockReturnValueOnce({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: mockFifteenMinutesFromNow,
      });
      (CookiesClass.getRefreshTokenCookieOptions as jest.Mock).mockReturnValueOnce({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: mockThirtyDaysFromNow,
        path: "/refresh-path",
      });
      //   CookiesClass.setAuthCookies({ mockRes, accessToken, refreshToken } as AuthCookieParams);
      expect(mockCookie).toHaveBeenCalledTimes(2);

      // Check accessToken cookie call
      expect(mockCookie).toHaveBeenCalledWith(
        "accessToken",
        accessToken,
        expect.objectContaining({
          sameSite: "strict",
          httpOnly: true,
          secure: true,
          expires: mockFifteenMinutesFromNow(),
        })
      );

      // Check refreshToken cookie call
      expect(mockCookie).toHaveBeenCalledWith(
        "refreshToken",
        refreshToken,
        expect.objectContaining({
          sameSite: "strict",
          httpOnly: true,
          secure: true,
          expires: mockThirtyDaysFromNow(),
          path: "/refresh-path",
        })
      );
    });
  });
  describe("clearAuthCookies method test suite", () => {
    it.skip("Should clear accessToken cookie and refreshToken cookie", async () => {
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
    it.skip("Should return uppercase", async () => {
      const options = CookiesClass.getAccessTokenCookieOptions();
      expect(options).toBeDefined();
      expect(options).toBe({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: mockFifteenMinutesFromNow(),
      });
    });
  });
  describe("getRefreshTokenCookieOptions method test suite", () => {
    it.skip("Should return uppercase", async () => {
      (fifteenMinutesFromNow as jest.Mock).mockReturnValueOnce("Date");
      const options = CookiesClass.getRefreshTokenCookieOptions();
      expect(options).toBeDefined();

      expect(options).toBe({
        sameSite: "strict",
        httpOnly: true,
        secure: true,
        expires: "Date",
        path: "/refresh-path",
      });
    });
  });
});
