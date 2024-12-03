// import UserModel from "./user.model";
import mongoose from "mongoose";
import UserModel from "./user.model";
import { hashPassword, comparePasswords } from "../../utils/helpers/PasswordManage";
afterEach(() => {
  jest.restoreAllMocks();
});

describe("User Model", () => {
  it("should create a new user", () => {
    const user = new UserModel({
      name: "Mateusz",
      email: "test@gmail.com",
      password: "12345678",
    });
    expect(user).toHaveProperty("_id");
  });
  it("should throw error for required fields", async () => {
    const user = new UserModel();

    try {
      user.validate();
    } catch (err: any) {
      console.log(err);
      expect(err.errors._message).toBe("User validation failed");
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });
});

// Mock the utility functions
jest.mock("../../utils/helpers/PasswordManage", () => ({
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
}));

describe("UserModel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should hash password before saving", async () => {
    const mockHashedPassword = "hashed_password";
    (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);

    const user = new UserModel({
      email: "test@example.com",
      password: "plain_password",
      verified: true,
    });

    await user.save();

    expect(hashPassword).toHaveBeenCalledWith("plain_password");
    expect(user.password).toBe(mockHashedPassword);
  });

  it.skip("should not hash password if it is not modified", async () => {
    const mockHashedPassword = "hashed_password";
    (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);

    const user = new UserModel({
      email: "test@example.com",
      password: "plain_password",
      verified: true,
    });

    await user.save();

    user.email = "updated@example.com";
    await user.save();

    expect(hashPassword).toHaveBeenCalledTimes(1); // Only on initial save
    expect(user.password).toBe(mockHashedPassword);
  });

  it.skip("should compare passwords correctly", async () => {
    (comparePasswords as jest.Mock).mockResolvedValue(true);

    const user = new UserModel({
      email: "test@example.com",
      password: "hashed_password",
      verified: true,
    });

    const result = await user.comparePassword("plain_password");

    expect(comparePasswords).toHaveBeenCalledWith("plain_password", "hashed_password");
    expect(result).toBe(true);
  });

  it.skip("should omit password from user object", async () => {
    const user = new UserModel({
      email: "test@example.com",
      password: "plain_password",
      verified: true,
    });

    await user.save();

    const userWithoutPassword = user.omitPassword();

    expect(userWithoutPassword).toEqual(
      expect.objectContaining({
        email: "test@example.com",
        verified: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
    expect((userWithoutPassword as any).password).toBeUndefined();
  });
});
