import request from "supertest";
import { connectDb, closeDb } from "./db-handler";
import app from "../index";

beforeAll(async () => await connectDb());
// afterEach(async () => await clearDb);
afterAll(async () => await closeDb());

describe("Auth controller E2E tests", () => {
  describe("[POST] - REGISTER USER ", () => {
    it("Should throw validation user", async () => {
      const res = await request(app).post("/api/v1.1.1/auth/register").send({
        name: "test",
        email: "test123@gmail.com",
        password: "e2etest1@#",
      });
      expect(res.statusCode).toBe(400);
    });
    it("Should add user", async () => {
      const res = await request(app).post("/api/v1.1.1/auth/register").send({
        name: "test",
        email: "tes1t1213@gmail.com",
        password: "e2etest1@#",
        confirmPassword: "e2etest1@#",
      });
      expect(res.statusCode).toBe(201);
    });
  });
});
