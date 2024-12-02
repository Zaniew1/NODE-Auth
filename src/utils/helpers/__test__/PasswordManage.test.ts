import bcrypt from "bcryptjs";
import { comparePasswords, hashPassword } from "../PasswordManage";
import { Message } from "../../constants/messages";
import { HttpErrors } from "../../constants/http";

describe("Password manage file test suite", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
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
    it("Should return false if bcrypt.compare throws an error", async () => {
      const passToValidate = "123";
      const passFromDb = "1234";
      const functionSpy = jest.spyOn(bcrypt, "compare");
      functionSpy.mockRejectedValueOnce(new Error("Mocked error") as never);

      const compareResult = await comparePasswords(passToValidate, passFromDb);
      expect(compareResult).toBe(false);
    });
  });
  describe("hashPassword function test suite", () => {
    it("Should hash password", async () => {
      const pass = "12354";
      let functionSpy: jest.SpyInstance = jest.spyOn(bcrypt, "hash");
      functionSpy.mockResolvedValueOnce("hashedPassword");
      const hashResult = await hashPassword(pass, 10);
      expect(hashResult).toBe("hashedPassword");
    });
    it("Should return false if password is not hashable", async () => {
      const pass = "1234";
      let functionSpy: jest.SpyInstance = jest.spyOn(bcrypt, "hash");
      functionSpy.mockResolvedValueOnce(false);
      const hashResult = await hashPassword(pass);
      expect(hashResult).toBe(false);
    });
    it("Should return false if bcrypt.hash throws an error", async () => {
      const pass = "";
      const functionSpy = jest.spyOn(bcrypt, "hash");
      functionSpy.mockRejectedValueOnce(new Error(Message.FAIL_INTERNAL_SERVER_ERROR) as never);
      await expect(hashPassword(pass)).rejects.toThrow(Message.FAIL_INTERNAL_SERVER_ERROR);
    });
  });
});
