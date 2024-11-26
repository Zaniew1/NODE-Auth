import appAssert from "../appAssert";
import { HttpErrors } from "../../constants/http";
import { Message } from "../../constants/messages";
import { AssertionError } from "node:assert";

const httpStatusCode = HttpErrors.NOT_FOUND;
const message = Message.FAIL_INTERNAL_SERVER_ERROR;

describe("AppAssert function test suite", () => {
  it("Should do nothing if condition is true", async () => {
    const condition = true;
    const assert = appAssert(condition, httpStatusCode, message);
    expect(assert).not.toBeDefined();
  });
  it("Should throw assertion error if false", async () => {
    const condition = false;
    expect(() => appAssert(condition, httpStatusCode, message)).toThrow(AssertionError);
    expect(() => appAssert(condition, httpStatusCode, message)).toThrow(Message.FAIL_INTERNAL_SERVER_ERROR);
  });
});
