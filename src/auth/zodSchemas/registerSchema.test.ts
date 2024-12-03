import { registerSchema } from "./registerSchema";

describe("registerSchema validation", () => {
  it("should validate successfully with valid data", () => {
    const validData = {
      name: "test",
      surname: "test",
      email: "test@gmail.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      userAgent: "Mozilla/5.0",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validData);
  });

  it("should fail if name is too short", () => {
    const invalidData = {
      name: "te",
      surname: "test",
      email: "test@gmail.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Name to short, 3 chars minimum");
  });

  it("should fail if passwords do not match", () => {
    const invalidData = {
      name: "test",
      surname: "test",
      email: "test@gmail.com",
      password: "Password1!",
      confirmPassword: "Password2!",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Passwords do not match");
  });

  it("should fail if password does not meet complexity requirements", () => {
    const invalidData = {
      name: "test",
      surname: "test",
      email: "test@gmail.com",
      password: "password",
      confirmPassword: "password",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Password needs at least 8 chars, 1 number, 1 big letter and 1 special char");
  });

  it("should handle optional fields correctly", () => {
    const validData = {
      name: "test",
      email: "test@gmail.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "test",
      email: "test@gmail.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    });
  });
});
