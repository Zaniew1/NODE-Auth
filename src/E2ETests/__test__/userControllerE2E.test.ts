import { agent } from "supertest";
import { connectDb, closeDb } from "./db-handler";
import app from "../../index";
import { HttpErrors } from "../../utils/constants/http";
import { Message } from "../../utils/constants/messages";
let mockAccessToken: string;
let mockRefreshToken: string;
const registerPath = "/api/v1.1.1/auth/register";
const randomUid = Math.floor(Math.random() * 10000000);
const userMail = `test${randomUid}12@gmail.com`;
beforeAll(async () => {
  await connectDb();
  const res = await agent(app).post(registerPath).send({
    name: "test",
    email: userMail,
    surname: "Mateusz",
    password: "e2etest1@#1",
    confirmPassword: "e2etest1@#1",
  });
  // mockRefreshToken = res.header;
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
});
afterAll(async () => await closeDb());

const userPath = "/api/v1.1.1/user";

describe("User controller E2E tests", () => {
  describe("[GET] - Get user", () => {
    it("Should get one user", async () => {
      const res = await agent(app)
        .get(userPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body).toBeDefined();
      expect(res.body).toMatchObject({ email: userMail });
    });
    it("Should throw validation error in no accessToken", async () => {
      const res = await agent(app)
        .get(userPath)
        .set("Cookie", [`refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
  });
  describe("[DELETE] - Delete user", () => {
    it("Should delete one user", async () => {
      const res = await agent(app)
        .delete(userPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_USER_DELETED);
    });
    it("Should throw validation error in no id", async () => {
      const res = await agent(app)
        .delete(userPath)
        .set("Cookie", [`refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
  });
});
