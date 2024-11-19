// import { getSessionHandler, deleteSessionHandler } from "./sessionController";
describe("sessionController test suite", () => {
  describe("getSessionHandler test suite", () => {
    it("Should get proper userId", async () => {
      expect(true).toBe(true);
    });
    it("Should find all sessions in database by userId", async () => {
      expect(true).toBe(true);
    });
    it("Should return error if sessions is not found", async () => {
      expect(true).toBe(true);
    });
    it("Should return 200 status if everything is fine", async () => {
      expect(true).toBe(true);
    });
    it("Should return all sessions in JSON with 1 session with key isCurrent:true", async () => {
      expect(true).toBe(true);
    });
  });
  describe("deleteSessionHandler test suite", () => {
    it("Should get proper sessionId", async () => {
      expect(true).toBe(true);
    });
    it("Should return error if sessionid is not string", async () => {
      expect(true).toBe(true);
    });
    it("Should find session in database by id and delete it", async () => {
      expect(true).toBe(true);
    });
    it("Should return error if session is not found", async () => {
      expect(true).toBe(true);
    });
    it("Should return 200 status if everything is fine", async () => {
      expect(true).toBe(true);
    });
  });
});
