import jwt, { sign, verify } from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload, JWT } from "../Jwt";
import { AssertionError } from "node:assert";
import { Message } from "../../constants/messages";
import AppError, { AppErrorCode } from "../appError";
import { HttpErrors } from "../../constants/http";
jest.mock("jsonwebtoken");

describe("JWT class test suite", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    (verify as jest.Mock).mockReset();
    (sign as jest.Mock).mockReset();
  });

  describe("signAccessToken method test suite", () => {
    it("Should return proper aceess token", async () => {
      const payloadMock: AccessTokenPayload = {
        userId: "672b50c01df576319309286e",
        sessionId: "67290b913991ecf85c227fb9",
      };
      (sign as jest.Mock).mockReturnValueOnce("token");
      const signAccess = JWT.signAccessToken(payloadMock);
      expect(signAccess).toBe("token");
    });
  });
  describe("signRefreshToken method test suite", () => {
    it("Should  return proper aceess token", async () => {
      const payloadMock: RefreshTokenPayload = {
        sessionId: "67290b913991ecf85c227fb9",
      };
      (sign as jest.Mock).mockReturnValueOnce("token");
      const signAccess = JWT.signRefreshToken(payloadMock);
      expect(signAccess).toBe("token");
      (sign as jest.Mock).mockClear();
    });
  });
  describe("validateAccessToken method test suite", () => {
    it("Should return payload if successful", async () => {
      const payloadMock: AccessTokenPayload = {
        userId: "123",
        sessionId: "123",
      };
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTYiLCJ1c2VySWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTIiLCJpYXQiOjE3MzI1NTEwNDgsImV4cCI6MTczMjU1MTk0OCwiYXVkIjpbIlVzZXIiXX0.OGgHwwYygLVPGUZ3Dh2VxY9I1dXBWE6TKs_e-yk-PRo";
      (verify as jest.Mock).mockReturnValueOnce(payloadMock);
      const payload = JWT.validateAccessToken(token);
      expect(payload).toBe(payloadMock);
    });
    it("Should throw error if no payload", () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTYiLCJ1c2VySWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTIiLCJpYXQiOjE3MzI1NTEwNDgsImV4cCI6MTczMjU1MTk0OCwiYXVkIjpbIlVzZXIiXX0.OGgHwwYygLVPGUZ3Dh2VxY9I1dXBWE6TKs_e-yk-PRo";
      const accessTokenSecret = "secret";
      let findSpy: jest.SpyInstance = jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
        throw new AppError(HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
      });

      (verify as jest.Mock).mockImplementationOnce(() => {
        throw new AppError(HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
      });

      expect(() => JWT.validateAccessToken(token)).toThrow(AssertionError);
      expect(() => JWT.validateAccessToken(token)).toThrow("Error: " + Message.FAIL_USER_NOT_AUTHORIZED);
    });
  });
  describe("validateRefreshToken method test suite", () => {
    it("Should return payload if successful", async () => {
      const payloadMock: RefreshTokenPayload = {
        sessionId: "123",
      };
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NzQ0YTE4OGY0NmMzNTM2YTQ3YTgwYTYiLCJpYXQiOjE3MzI1NTEwNDgsImV4cCI6MTczNTE0MzA0OCwiYXVkIjpbIlVzZXIiXX0.4yfgGAW5yOiDbYmxoSphPIA9X5ZNcYrWh0yMIjUKB2U";
      (verify as jest.Mock).mockReturnValueOnce(payloadMock);
      const payload = JWT.validateRefreshToken(token);
      expect(payload).toBe(payloadMock);
    });
    it("Should throw error if no payload", () => {
      const token = ""; // Invalid or empty token
      let findSpy: jest.SpyInstance = jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
        throw new AppError(HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
      });

      (verify as jest.Mock).mockImplementationOnce(() => {
        throw new AppError(HttpErrors.UNAUTHORIZED, Message.FAIL_USER_NOT_AUTHORIZED, AppErrorCode.InvalidAccessToken);
      });
      expect(() => JWT.validateRefreshToken(token)).toThrow(AssertionError);
      expect(() => JWT.validateRefreshToken(token)).toThrow("Error: " + Message.FAIL_USER_NOT_AUTHORIZED); // Adjust error message if needed
    });
  });
});
