import { fiveMinutesAgo, fifteenMinutesFromNow, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from "../date";

describe("Date file test suite", () => {
  describe("fiveMinutesAgo function test suite", () => {
    it("Should return Date,  and shouldn't be null", async () => {
      const fiveMinutesAgoProperty: Date = fiveMinutesAgo();
      expect(fiveMinutesAgoProperty).toBeInstanceOf(Date);
      expect(fiveMinutesAgoProperty).not.toBeNaN();
      expect(fiveMinutesAgoProperty).not.toBeNull();
    });
  });
  describe("fifteenMinutesFromNow function test suite", () => {
    it("Should return Date,  and shouldn't be null", async () => {
      const fifteenMinutesFromNowProperty: Date = fifteenMinutesFromNow();
      expect(fifteenMinutesFromNowProperty).toBeInstanceOf(Date);
      expect(fifteenMinutesFromNowProperty).not.toBeNaN();
      expect(fifteenMinutesFromNowProperty).not.toBeNull();
    });
  });
  describe("oneHourFromNow function test suite", () => {
    it("Should return Date,  and shouldn't be null", async () => {
      const oneHourFromNowProperty: Date = oneHourFromNow();
      expect(oneHourFromNowProperty).toBeInstanceOf(Date);
      expect(oneHourFromNowProperty).not.toBeNaN();
      expect(oneHourFromNowProperty).not.toBeNull();
    });
  });
  describe("oneYearFromNow function test suite", () => {
    it("Should return Date,  and shouldn't be null", async () => {
      const oneYearFromNowProperty: Date = oneYearFromNow();
      expect(oneYearFromNowProperty).toBeInstanceOf(Date);
      expect(oneYearFromNowProperty).not.toBeNaN();
      expect(oneYearFromNowProperty).not.toBeNull();
    });
  });
  describe("thirtyDaysFromNow function test suite", () => {
    it("Should return Date,  and shouldn't be null", async () => {
      const thirtyDaysFromNowProperty: Date = thirtyDaysFromNow();
      expect(thirtyDaysFromNowProperty).toBeInstanceOf(Date);
      expect(thirtyDaysFromNowProperty).not.toBeNaN();
      expect(thirtyDaysFromNowProperty).not.toBeNull();
    });
  });
});
