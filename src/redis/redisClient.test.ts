import { createClient } from "redis";
import { connectRedis } from "./redisClient";

jest.mock("redis", () => {
  const mockRedisClient = {
    on: jest.fn(),
    connect: jest.fn(),
  };

  return {
    createClient: jest.fn(() => mockRedisClient),
  };
});
const mockRedisClient = createClient();

describe("Redis Client Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should connect to Redis if REDIS_ON is 'true'", () => {
    process.env.REDIS_ON = "true";
    connectRedis();
    expect(mockRedisClient.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mockRedisClient.connect).toHaveBeenCalled();
  });
  it("should not connect to Redis if REDIS_ON is not 'true'", () => {
    process.env.REDIS_ON = "false";
    expect(mockRedisClient.connect).not.toHaveBeenCalled();
  });
});
