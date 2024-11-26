import { getEnv } from "./env";
import "dotenv/config";

const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NODE_ENV: "MockEnv",
  };
});
afterEach(() => {
  process.env = originalEnv;
});
describe("env function test suite", () => {
  it("should return value  as string", () => {
    const value = "NODE_ENV";
    const defaultVal = "dev";
    const env = getEnv(value, defaultVal);
    expect(env).toBe("MockEnv");
    expect(env).toBeDefined();
  });
  it("should return error if value is undefined", () => {
    const value = "MockEnv";
    const defaultVal = undefined;
    expect(() => getEnv(value, defaultVal)).toThrow(`MIssing enviroment variable in .env file - ${value}`);
    expect(() => getEnv(value, defaultVal)).toThrow(Error);
  });
  it("should return default if value is undefined", () => {
    const value = "";
    const defaultVal = "dev";
    const env = getEnv(value, defaultVal);
    expect(env).toBe(defaultVal);
    expect(env).toBeDefined();
  });
});
