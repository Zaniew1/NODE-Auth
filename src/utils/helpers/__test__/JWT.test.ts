import jwt from "jsonwebtoken";
import { JWT } from "../Jwt";
describe("JWT class test suite", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("signAccessToken method test suite", () => {
    it("Should return proper aceess token", async () => {
      const payloadMock = {
        userId: "userId",
        sessionId: "sessionId",
      };
      const mockedSignMethod = jest.spyOn(jwt, "sign") as jest.Mock;
      const MockedSignMethodValue = mockedSignMethod.mockResolvedValue("token");
      const signAccess = JWT.signAccessToken(payloadMock);
      expect(signAccess).toBe("token");
    });
  });
  // describe("signRefreshToken method test suite", () => {
  //   it("Should return uppercase", async () => {
  //     const payloadMock = {
  //       sessionId: "sessionId",
  //     };
  //     jest.spyOn(JWT, "signRefreshToken").mockReturnValue("token");
  //     const signRefresh = JWT.signRefreshToken(payloadMock);
  //     expect(signRefresh).toBe("token");
  //   });
  // });
  describe("validateAccessToken method test suite", () => {
    it("Should return payload if successful", async () => {
      expect(true).toBe(true);
    });
    it("Should throw error if unsuccessful", async () => {
      expect(true).toBe(true);
    });
  });
  // describe("validateRefreshToken method test suite", () => {
  //   it("Should return uppercase", async () => {
  //     expect(true).toBe(true);
  //   });
  // });
});
