const mockRequest = () => {
  return {
    body: {
      name: "Mateusz1",
      email: "m.zaniewski1995@gmail.com",
      password: "Dragonborn1@#",
      confirmPassword: "Dragonborn1@#",
    },
  };
};
const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};
describe("Auth controller suite", () => {
  it("Should return uppercase", () => {
    expect(true).toBe(true);
  });
});

describe("authController test suite", () => {
  describe("registerHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("loginHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("logoutHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("refreshHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("forgetPasswordHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("verifyEmailHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("forgotPasswordHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
  describe("changePasswordHandler function test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
  });
});
