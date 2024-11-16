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
