import { startServer } from "./server"; // Adjust the path as needed
import { connectToDatabase } from "./db"; // Adjust the path

jest.mock("./db");

jest.mock("express", () => {
  const express = jest.requireActual("express");
  return {
    ...express,
    // Mock the listen function
    listen: jest.fn(),
  };
});

describe("startServer", () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        // Simulate the callback being called immediately (as it would be when the server starts)
        callback();
      }),
    };
    process.env.NODE_ENV = "dev";
    process.env.PORT = "5000";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start the server when NODE_ENV is "dev" or "prod"', async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();

    await startServer(mockApp);

    expect(mockApp.listen).toHaveBeenCalledTimes(1);
    expect(mockApp.listen).toHaveBeenCalledWith("5000", expect.any(Function));

    expect(connectToDatabase).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("Server running on port: 5000 on test environment");
    logSpy.mockRestore(); // Restore console.log
  });

  it('should not start the server when NODE_ENV is neither "dev" nor "prod"', async () => {
    process.env.NODE_ENV = "test";

    await startServer(mockApp);

    expect(mockApp.listen).toHaveBeenCalledTimes(0);
    expect(connectToDatabase).not.toHaveBeenCalled();
  });
});
