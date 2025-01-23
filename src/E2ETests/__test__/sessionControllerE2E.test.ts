import { agent } from "supertest";
import { connectDb, closeDb } from "./db-handler";
import app from "../../index";
import { HttpErrors } from "../../utils/constants/http";
import { Message } from "../../utils/constants/messages";
let mockAccessToken: string;
let mockRefreshToken: string;
let mockSessionToDelete: string;
const randomUid = Math.floor(Math.random() * 10000000);

const registerPath = "/api/v1.1.1/auth/register";
beforeAll(async () => {
  await connectDb();
  const res = await agent(app)
    .post(registerPath)
    .send({
      name: "test",
      email: `test${randomUid}12@gmail.com`,
      surname: "Mateusz",
      password: "e2etest1@#1",
      confirmPassword: "e2etest1@#1",
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
});
// afterEach(async () => await clearDb);
afterAll(async () => await closeDb());

const sessionPath = "/api/v1.1.1/session";

describe("Session controller E2E tests", () => {
  describe("[GET] - Get session", () => {
    it("Should get all sessions", async () => {
      const res = await agent(app)
        .get(sessionPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.sessions[0]._doc._id).toBeDefined();
      mockSessionToDelete = res.body.sessions[0]._doc._id;
    });
    it("Should throw validation error in no accessToken", async () => {
      const res = await agent(app)
        .get(sessionPath)
        .set("Cookie", [`refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
  });
  describe("[DELETE] - Delete session", () => {
    it("Should delete one session", async () => {
      const res = await agent(app)
        .delete(sessionPath)
        .set("Cookie", [`accessToken=${mockAccessToken};refreshToken=${mockRefreshToken}`])
        .send({ id: mockSessionToDelete });
      expect(res.statusCode).toBe(HttpErrors.OK);
      expect(res.body.message).toBe(Message.SUCCESS_SESSION_DELETED);
    });
    it("Should throw validation error in no id", async () => {
      const res = await agent(app)
        .delete(sessionPath)
        .set("Cookie", [`refreshToken=${mockRefreshToken}`])
        .send({});
      expect(res.statusCode).toBe(HttpErrors.INTERNAL_SERVER_ERROR);
    });
  });
});
