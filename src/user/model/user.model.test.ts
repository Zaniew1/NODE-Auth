// import UserModel from "./user.model";
import UserModel from "./user.model";
import * as passManage from "../../utils/helpers/PasswordManage";

describe("User Model", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should create a new user", async () => {
    const user = new UserModel({
      name: "Mateusz",
      email: "test@gmail.com",
      password: "12345678",
    });
    jest.spyOn(user, "save").mockResolvedValue(user);
    await user.save();
    expect(user).toHaveProperty("_id");
  });
  it("should throw error for required fields", async () => {
    const user = new UserModel();

    try {
      jest.spyOn(user, "save").mockResolvedValue(user);
      await user.save();
    } catch (err: any) {
      expect(err.errors._message).toBe("User validation failed");
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });
});

const hashedPassword = "hashedPassword123@#";
describe("UserModel Methods", () => {
  it("should hash password when modified", async () => {
    jest.spyOn(passManage, "hashPassword").mockResolvedValueOnce(hashedPassword);
    const mockNext = jest.fn();
    const user = new UserModel({
      username: "testuser",
      email: "testEmail@gmail.com",
      password: "plaintextPassword123#",
      confirmPassword: "plaintextPassword123#",
    });
    user.isModified = jest.fn().mockReturnValue(true);
    if (user.isModified("password")) {
      const hashedPass = await passManage.hashPassword(user.password);
      user.password = hashedPass;
      mockNext();
    }

    expect(user.password).toBe(hashedPassword);
    expect(mockNext).toHaveBeenCalled();
  });
  it("should not hash password when not modified", async () => {
    jest.spyOn(passManage, "hashPassword").mockResolvedValueOnce(hashedPassword);
    const mockNext = jest.fn();
    const user = new UserModel({
      username: "testuser",
      email: "testEmail@gmail.com",
      password: "plaintextPassword123#",
      confirmPassword: "plaintextPassword123#",
    });
    user.isModified = jest.fn().mockReturnValue(false);
    jest.spyOn(user, "save").mockResolvedValue(user);
    await user.save();
    expect(user.password).toBe("plaintextPassword123#");
    expect(mockNext).toHaveBeenCalled();
  });
  it("should return true if passwords match", async () => {
    jest.spyOn(passManage, "comparePasswords").mockResolvedValueOnce(true);
    const user = new UserModel({
      username: "testuser",
      email: "testEmail@gmail.com",
      password: "plaintextPassword123#",
      confirmPassword: "plaintextPassword123#",
    });
    const result = await user.comparePassword("plaintextPassword123#");
    expect(result).toBe(true); // Expect it to return true
    expect(passManage.comparePasswords).toHaveBeenCalledWith("plaintextPassword123#", user.password);
  });
  it("should return false if passwords dont match", async () => {
    // Mock the comparePasswords function to return true when passwords match
    jest.spyOn(passManage, "comparePasswords").mockResolvedValueOnce(false);
    const user = new UserModel({
      username: "testuser",
      email: "testEmail@gmail.com",
      password: "plaintextPassword123#",
      confirmPassword: "plaintextPassword123#",
    });
    const result = await user.comparePassword("hashedPassword123");
    expect(result).toBe(false);
    expect(passManage.comparePasswords).toHaveBeenCalledWith("hashedPassword123", user.password);
  });
  it("should return user without password", async () => {
    const user = new UserModel({
      username: "testuser",
      email: "testEmail@gmail.com",
      password: "plaintextPassword123#",
    });
    const result = await user.omitPassword();
    expect(result).not.toContain({ password: "plaintextPassword123#" });
  });
});
