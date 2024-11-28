// import { Response } from "express";
// import Cookies, { AuthCookieParams } from "../cookies";
// import { fifteenMinutesFromNow, thirtyDaysFromNow } from "../date";
// const mockCookie = jest.fn();
// const res: Partial<Response> = {
//   cookie: mockCookie,
// };
// const accessToken = "testAccessToken";
// const refreshToken = "testRefreshToken";
// jest.mock("../cookies");
// const mockFifteenMinutesFromNow = jest.fn(() => new Date(Date.now() + 15 * 60 * 1000));
// const mockThirtyDaysFromNow = jest.fn(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
// describe("Cookie class test suite", () => {
//   afterEach(() => {
//     jest.restoreAllMocks();
//     (Cookies.getAccessTokenCookieOptions as jest.Mock).mockReset();
//     (Cookies.getRefreshTokenCookieOptions as jest.Mock).mockReset();
//   });
//   describe("setAuthCookies method test suite", () => {
//     it("Should set accessToken cookie and refresToken cookie", async () => {
//       (Cookies.getAccessTokenCookieOptions as jest.Mock).mockReturnValueOnce({
//         sameSite: "strict",
//         httpOnly: true,
//         secure: true,
//         expires: mockFifteenMinutesFromNow,
//       });
//       (Cookies.getRefreshTokenCookieOptions as jest.Mock).mockReturnValueOnce({
//         sameSite: "strict",
//         httpOnly: true,
//         secure: true,
//         expires: mockThirtyDaysFromNow,
//         path: "/refresh-path",
//       });
//       Cookies.setAuthCookies({ res, accessToken, refreshToken } as AuthCookieParams);
//       expect(mockCookie).toHaveBeenCalledTimes(2);

//       // Check accessToken cookie call
//       expect(mockCookie).toHaveBeenCalledWith(
//         "accessToken",
//         accessToken,
//         expect.objectContaining({
//           sameSite: "strict",
//           httpOnly: true,
//           secure: true,
//           expires: mockFifteenMinutesFromNow(),
//         })
//       );

//       // Check refreshToken cookie call
//       expect(mockCookie).toHaveBeenCalledWith(
//         "refreshToken",
//         refreshToken,
//         expect.objectContaining({
//           sameSite: "strict",
//           httpOnly: true,
//           secure: true,
//           expires: mockThirtyDaysFromNow(),
//           path: "/refresh-path",
//         })
//       );
//     });
//   });
//   describe("clearAuthCookies method test suite", () => {
//     it("Should clear accessToken cookie and refreshToken cookie", async () => {
//       expect(true).toBe(true);
//     });
//   });
//   describe("getAccessTokenCookieOptions method test suite", () => {
//     it("Should return uppercase", async () => {
//       const options = Cookies.getAccessTokenCookieOptions();
//       expect(options).toBeDefined();
//       expect(options).toBe({
//         sameSite: "strict",
//         httpOnly: true,
//         secure: true,
//         expires: mockFifteenMinutesFromNow(),
//       });
//     });
//   });
//   describe("getRefreshTokenCookieOptions method test suite", () => {
//     it("Should return uppercase", async () => {
//       (fifteenMinutesFromNow as jest.Mock).mockReturnValueOnce("Date");
//       const options = Cookies.getRefreshTokenCookieOptions();
//       expect(options).toBeDefined();

//       expect(options).toBe({
//         sameSite: "strict",
//         httpOnly: true,
//         secure: true,
//         expires: "Date",
//         path: "/refresh-path",
//       });
//     });
//   });
// });
