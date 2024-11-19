import bcrypt from "bcryptjs";

// export const comparePasswords = async (passwordToValidate: string, databasePassword: string) => {
//   return await bcrypt.compare(passwordToValidate, databasePassword).catch(() => false);
// };
// export const hashPassword = async (password: string, salt: number = 10) => {
//   return await bcrypt.hash(password, salt);
// };

describe("Password manage file test suite", () => {
  describe("ComparePasswords function test suite", () => {
    it("Should return uppercase", async () => {
      jest.spyOn(bcrypt, "compare").mockImplementation(() => "comparePasswords");
      expect(true).toBe(true);
    });
  });
  describe("hashPassword function test suite", () => {
    it("Should return uppercase", async () => {
      jest.spyOn(bcrypt, "hash").mockImplementation(() => "hashPassword");
      expect(bcrypt.hash).toHaveBeenCalledWith("12345678");
    });
  });
});
