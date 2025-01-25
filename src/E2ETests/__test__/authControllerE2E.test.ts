import { agent } from "supertest";
import { connectDb, closeDb } from "./db-handler";
import app from "../../index";
import { Message } from "../../utils/constants/messages";
import { HttpErrors } from "../../utils/constants/http";
import { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import { VerificationCodeType } from "../../types/verificationCodeManage";
import { oneYearFromNow, oneHourFromNow } from "../../utils/helpers/date";
import { UserDocument } from "../../user/model/user.model";
import DatabaseClass from "../../utils/Database/Database";

const randomUid = Math.floor(Math.random() * 10000000);
const userEmail = `test${randomUid}12@gmail.com`;
beforeAll(async () => {
  await connectDb();
});
// afterEach(async () => await clearDb);
afterAll(async () => await closeDb());
const registerPath = "/api/v1.1.1/auth/register";
const loginPath = "/api/v1.1.1/auth/login";
const logoutPath = "/api/v1.1.1/auth/logout";
const changePassPath = "/api/v1.1.1/auth/changePassword";
const forgotPassPath = "/api/v1.1.1/auth/forgotPassword"; // :verificationCode
const verifyPath = "/api/v1.1.1/auth/verify"; // :code
const refreshPath = "/api/v1.1.1/auth/refresh";
let mockUser: UserDocument;
let mockAccessToken: string;
let mockRefreshToken: string;
let mockVerificationCode: VerificationCodeDocument;
let mockVerificateEmailCode: VerificationCodeDocument;
describe("Auth controller E2E tests", () => {
  describe("[POST] - REGISTER USER ", () => {
    it("Should throw validation user", async () => {
      const res = await agent(app).post(registerPath).send({
        name: "test",
        email: userEmail,
        password: "e2etest1@#",
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.text).errors[0].path).toBe("confirmPassword");
      expect(JSON.parse(res.text).errors[0].message).toBe("Confirm password is required");
    });
    it("Should add user", async () => {
      const res = await agent(app).post(registerPath).send({
        name: "test",
        email: userEmail,
        surname: "Mateusz",
        password: "e2etest1@#1",
        confirmPassword: "e2etest1@#1",
      });
      mockUser = res.body.user as UserDocument;
      mockVerificateEmailCode = await DatabaseClass.verificationCode.create({
        userId: mockUser._id,
        type: VerificationCodeType.EmailVerification,
        expiresAt: oneYearFromNow(),
      });
      if (Array.isArray(res.header["set-cookie"])) {
        mockAccessToken = res.header["set-cookie"]
          .find((cookie: string) => cookie.startsWith("accessToken="))
          ?.split(";")[0]
          .split("=")[1];
      }
      if (Array.isArray(res.header["set-cookie"])) {
        mockRefreshToken = res.header["set-cookie"]
          .find((cookie: string) => cookie.startsWith("refreshToken="))
          ?.split(";")[0]
          .split("=")[1];
      }
      expect(res.statusCode).toBe(HttpErrors.CREATED);
      expect(res.body.message).toBe(Message.SUCCESS_USER_CREATE);
      expect(res.body.user).toBeDefined();
    });
  });

  describe("[POST] - LOGIN USER ", () => {
    it("Should throw validation error", async () => {
      const res = await agent(app).post(loginPath).send({
        email: userEmail,
      });
      expect(JSON.parse(res.text).errors[0].path).toBe("password");
      expect(JSON.parse(res.text).errors[0].message).toBe("Password is required");
      expect(res.statusCode).toBe(HttpErrors.BAD_REQUEST);
    });
    it("Should login user", async () => {
      const res = await agent(app).post(loginPath).send({
        email: userEmail,
        password: "e2easdasdtest1@#",
      });
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_LOGIN);
    });
  });

  describe("[GET] - REFRESH USER ", () => {
    it("Should throw validation error", async () => {
      const res = await agent(app).get(refreshPath).set("Cookie", [``]).send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
    it("Should refresh user's tokens (access, refresh - if is shorter than 1 day)", async () => {
      const res = await agent(app)
        .get(refreshPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_REFRESHED_TOKEN);
    });
  });

  describe("[POST] - LOGOUT USER ", () => {
    it("Should throw validation error", async () => {
      const res = await agent(app).post(logoutPath).set("Cookie", ["accessToken=asd"]).send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
    it("Should logout user", async () => {
      const res = await agent(app)
        .post(logoutPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_LOGOUT);
    });
  });

  describe("[PATCH] - FORGOT PASSWORD ", () => {
    it("Should send mail with verificationCode", async () => {
      const res = await agent(app).patch(forgotPassPath).send({
        email: mockUser.email,
      });
      mockVerificationCode = await DatabaseClass.verificationCode.create({
        userId: mockUser._id,
        type: VerificationCodeType.PasswordReset,
        expiresAt: oneHourFromNow(),
      });
      // expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_FORGET_PASSWORD);
    });
    it("Should throw validation error", async () => {
      const res = await agent(app).patch(forgotPassPath).send({ email: "" });
      expect(res.statusCode).toBe(HttpErrors.BAD_REQUEST);
      expect(JSON.parse(res.body.message)[0].message).toBe("Email to short, 3 chars minimum");
    });
  });

  describe("[POST] - CHANGE PASSWORD FOR USER ", () => {
    it("Should throw validation error", async () => {
      const res = await agent(app).post(changePassPath).send({
        verificationCode: "",
        password: "newPassword1@#",
      });
      expect(res.statusCode).toBe(HttpErrors.BAD_REQUEST);
      expect(JSON.parse(res.body.message)[0].message).toBe("Verification code is minimum 1 char");
    });
    it("Should change password for user", async () => {
      const res = await agent(app).post(changePassPath).send({
        verificationCode: mockVerificationCode._id,
        password: "newPassword1@#",
      });
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_CHANGED_PASSWORD);
    });
  });
  describe("[GET] - VERIFY USER ", () => {
    it("Should throw validation error", async () => {
      const res = await agent(app)
        .get(verifyPath + "/")
        .send({});
      expect(res.statusCode).toBe(HttpErrors.NOT_FOUND);
    });
    it("Should verify user's email", async () => {
      const res = await agent(app)
        .get(verifyPath + "/" + String(mockVerificateEmailCode._id))
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_VERIFIED_MAIL);
    });
  });
});
