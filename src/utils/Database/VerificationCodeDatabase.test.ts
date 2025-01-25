import CacheClass from "../../redis/CacheClass";
import UserModel, { UserDocument } from "../../user/model/user.model";
import VerificationCodeModel, { VerificationCodeDocument } from "../../auth/model/verificationCode.model";
import VerficationDatabase from "./VerificationCodeDatabase";
import mongoose from "mongoose";
import { VerificationCodeType } from "../../types/verificationCodeManage";
const VerificationDb = new VerficationDatabase();
const mockUserId = new mongoose.Types.ObjectId("123456789123456789123456") as UserDocument["_id"];
const mockVerificationId = new mongoose.Types.ObjectId("123456789123456789123456") as VerificationCodeDocument["_id"];
const mockEmail: string = "mockMail";
const mockVerificationData = {
  _id: mockVerificationId,
  userId: mockUserId,
  type: VerificationCodeType.PasswordReset,
  createdAt: Date.now() + 10000,
  toObject: jest.fn(() => ({
    _id: mockVerificationId,
    userId: mockUserId,
    type: VerificationCodeType.PasswordReset,
    createdAt: Date.now(),
  })),
} as unknown as Partial<VerificationCodeDocument> as VerificationCodeDocument;

describe("verificationCodeDatabase test suite", () => {
  describe("create method test suite", () => {
    it("should create  verification code", async () => {
      jest.spyOn(VerificationCodeModel, "create").mockResolvedValue(mockVerificationData as any);
      const result = await VerificationDb.create(mockVerificationData);
      expect(result).toEqual(mockVerificationData);
    });
  });
  describe("findByIdAndDelete method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(VerificationCodeModel, "findByIdAndDelete").mockResolvedValue(null);
      jest.spyOn(CacheClass, "deleteHashCacheById").mockResolvedValue(null);
      const result = await VerificationDb.findByIdAndDelete(mockUserId);
      expect(result).toBeNull();
    });
    it("should return user id if there was data in db", async () => {
      jest.spyOn(CacheClass, "getStringCache").mockResolvedValue(null);
      jest.spyOn(VerificationCodeModel, "findByIdAndDelete").mockResolvedValue(mockVerificationData);
      const result = await VerificationDb.findByIdAndDelete(mockUserId);
      expect(result).toEqual(mockVerificationData);
    });
  });
  describe("findUsersCodes method test suite", () => {
    it("should return 0 if no data was found", async () => {
      jest.spyOn(VerificationCodeModel, "countDocuments").mockResolvedValue(0);
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue(null);
      const result = await VerificationDb.findUsersCodes(mockUserId, VerificationCodeType.PasswordReset);
      expect(result).toBe(0);
    });
    it("should return number of codes if data was in Cache", async () => {
      const mockNumberOfCodes = 1;
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue([String(mockVerificationData._id)]);
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(mockVerificationData);
      const result = await VerificationDb.findUsersCodes(mockUserId, VerificationCodeType.PasswordReset);
      expect(result).toBe(mockNumberOfCodes);
    });
    it("should return user data if data was in db", async () => {
      const mockNumberOfCodes = 1;
      jest.spyOn(CacheClass, "getCacheList").mockResolvedValue(null);
      jest.spyOn(VerificationCodeModel, "countDocuments").mockResolvedValue(mockNumberOfCodes);
      const result = await VerificationDb.findUsersCodes(mockUserId, VerificationCodeType.PasswordReset);
      expect(result).toBe(mockNumberOfCodes);
    });
  });
  describe("findOneByIdAndType method test suite", () => {
    it("should return null if no data was found", async () => {
      jest.spyOn(VerificationCodeModel, "findOne").mockResolvedValue(null);
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(null);
      const result = await VerificationDb.findOneByIdAndType(mockVerificationId, VerificationCodeType.EmailVerification);
      expect(result).toBeNull();
    });
    it("should return user data if data was in Cache", async () => {
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(mockVerificationData);
      const result = await VerificationDb.findOneByIdAndType(mockVerificationId, VerificationCodeType.EmailVerification);
      expect(result).toEqual(mockVerificationData);
    });
    it("should return user data if data was in db", async () => {
      jest.spyOn(CacheClass, "getHashCache").mockResolvedValue(null);
      jest.spyOn(VerificationCodeModel, "findOne").mockResolvedValue(mockVerificationData);
      const result = await VerificationDb.findOneByIdAndType(mockVerificationId, VerificationCodeType.EmailVerification);
      expect(result).toEqual(mockVerificationData);
    });
  });
});
