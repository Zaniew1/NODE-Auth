// import UserModel from "./user.model";
import UserModel from "./user.model";

describe("User Model", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
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
      expect(err.errors._message).toBe("User validation failed");
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });
});

// describe("UserModel Methods", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("hashPassword", () => {
//     // it("should hash password correctly", async () => {
//     //   const mockHashedPassword = "hashedPassword";
//     //   const password = "password123";
//     //   const result = await hashPassword(password);
//     //   expect(result).toBe(mockHashedPassword);
//     //   expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
//     // });
//   });
// });
