import mongoose from "mongoose";
import { MONGO_DB_PASS } from "../utils/constants/env";
import { connectToDatabase } from "./db";

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(process, "exit").mockImplementation((() => undefined) as any);

describe("connectToDatabase function", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it("should connect to the database successfully", async () => {
    jest.spyOn(mongoose, "connect").mockResolvedValueOnce(mongoose as any);

    await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_DB_PASS);
    expect(console.log).toHaveBeenCalledWith("Successfully connected to DB");
    expect(console.error).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("should handle connection failure", async () => {
    const mockError = undefined;
    jest.spyOn(mongoose, "connect").mockRejectedValueOnce(undefined);

    await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_DB_PASS);
    expect(console.error).toHaveBeenCalledWith("Could not connect to DB", mockError);
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.log).not.toHaveBeenCalled();
  });
});
