import bcrypt from "bcryptjs";
import { comparePasswords, hashPassword } from "../PasswordManage";

describe("Password manage file test suite", () => {
  describe("ComparePasswords function test suite", () => {
    it("Should return true if passwords are the same", async () => {
      const passToValidate = "123";
      const passFromDb = "123";
      let functionSpy: jest.SpyInstance = jest.spyOn(bcrypt, "compare");
      functionSpy.mockResolvedValueOnce(true);
      const compareResult = await comparePasswords(passToValidate, passFromDb);
      expect(compareResult).toBe(true);
    });
    it("Should return false if passwords are not the same", async () => {
      const passToValidate = "123";
      const passFromDb = "1234";
      let functionSpy: jest.SpyInstance = jest.spyOn(bcrypt, "compare");
      functionSpy.mockResolvedValueOnce(false);
      const compareResult = await comparePasswords(passToValidate, passFromDb);
      expect(compareResult).toBe(false);
    });
  });
  describe("hashPassword function test suite", () => {
    it("Should hash password", async () => {
      const pass = "12354";
      let functionSpy: jest.SpyInstance = jest.spyOn(bcrypt, "hash");
      functionSpy.mockResolvedValueOnce("hashedPassword");
      const hashResult = await hashPassword(pass);
      expect(hashResult).toBe("hashedPassword");
    });
  });
});
