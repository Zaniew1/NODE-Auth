import CacheClass from '../../redis/CacheClass';
import UserModel, { UserDocument } from '../../user/model/user.model';
import UserDatabase from './UserDatabase';
import mongoose from 'mongoose';
const UserDb = new UserDatabase();
const mockUserId = new mongoose.Types.ObjectId('123456789123456789123456') as UserDocument['_id'];
const mockEmail: string = 'mockMail';
const mockUserData = {
  _id: mockUserId,
  name: 'mockName',
  surname: 'mockSuername',
  email: 'mockEmail@test.pl',
  verified: false,
  toObject: jest.fn(() => ({
    _id: mockUserId,
    name: 'mockName',
    surname: 'mockSuername',
    email: 'mockEmail@test.pl',
    verified: false,
  })),
} as Partial<UserDocument> as UserDocument;
describe('userDatabase test suite', () => {
  describe('create method test suite', () => {
    it('should create user', async () => {
      jest.spyOn(UserModel, 'create').mockResolvedValue(mockUserData as any);
      const result = await UserDb.create(mockUserData);
      expect(result.toObject()).toEqual(mockUserData.toObject());
    });
  });
  describe('existsByEmail method test suite', () => {
    it('should return null if no data was found', async () => {
      jest.spyOn(UserModel, 'exists').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(null);
      const result = await UserDb.existsByEmail(mockEmail);
      expect(result).toBeNull();
    });
    it('should return user id if there was data in cache', async () => {
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(mockUserId);
      const result = await UserDb.existsByEmail(mockEmail);
      expect(result).toBe(mockUserId);
    });
    it('should return user id if there was data in db', async () => {
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(null);
      jest.spyOn(UserModel, 'exists').mockResolvedValue(mockUserId);
      const result = await UserDb.existsByEmail(mockEmail);
      expect(result).toBe(mockUserId);
    });
  });
  describe('findOneByMail method test suite', () => {
    it('should return null if no data was found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'getHashCache').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(null);
      const result = await UserDb.findOneByMail(mockEmail);
      expect(result).toBeNull();
    });
    it('should return user data if data was in Cache', async () => {
      jest.spyOn(CacheClass, 'setStringCache').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'setHashCache').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(mockUserId);
      jest.spyOn(CacheClass, 'getHashCache').mockResolvedValue(mockUserData);
      const result = await UserDb.findOneByMail(mockEmail);

      expect(result?.toObject()).toMatchObject(mockUserData.toObject());
    });
    it('should return user data if data was in db', async () => {
      jest.spyOn(CacheClass, 'getStringCache').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'setStringCache').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'setHashCache').mockResolvedValue(null);
      jest.spyOn(UserModel, 'findOne').mockResolvedValue(mockUserData);
      const result = await UserDb.findOneByMail(mockEmail);
      expect(result).toEqual(mockUserData);
    });
  });
  describe('findByIdAndUpdate method test suite', () => {
    it('should return null if no data was found', async () => {
      jest.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'replaceHashCacheData').mockResolvedValue(null);
      const result = await UserDb.findByIdAndUpdate(mockUserId, { name: 'newName' });
      expect(result).toBeNull();
    });
    it('should update data and return user', async () => {
      jest.spyOn(CacheClass, 'replaceHashCacheData').mockResolvedValue(null);
      jest.spyOn(UserModel, 'findByIdAndUpdate').mockResolvedValue(mockUserData);
      const result = await UserDb.findByIdAndUpdate(mockUserId, { name: 'newName' });
      expect(result).toEqual(mockUserData);
    });
  });
  describe('findById method test suite', () => {
    it('should return null if no data was found', async () => {
      jest.spyOn(UserModel, 'findById').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'getHashCache').mockResolvedValue(null);
      const result = await UserDb.findById(mockUserId);
      expect(result).toBeNull();
    });
    it('should return user if data was in Cache', async () => {
      jest.spyOn(CacheClass, 'getHashCache').mockResolvedValue(mockUserData);
      const result = await UserDb.findById(mockUserId);
      expect(result?.toObject()).toMatchObject(mockUserData.toObject());
    });
    it('should return user if data was in Db', async () => {
      jest.spyOn(CacheClass, 'getHashCache').mockResolvedValue(null);
      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockUserData);
      const result = await UserDb.findById(mockUserId);
      expect(result).toEqual(mockUserData);
    });
  });
  describe('findByIdAndDelete method test suite', () => {
    it('should return null if no data was found', async () => {
      jest.spyOn(UserModel, 'findByIdAndDelete').mockResolvedValue(null);
      jest.spyOn(CacheClass, 'deleteHashCacheById').mockResolvedValue(null);
      const result = await UserDb.findByIdAndDelete(mockUserId);
      expect(result).toBeNull();
    });
    it('should return user if data was found', async () => {
      jest.spyOn(CacheClass, 'deleteHashCacheById').mockResolvedValue(null);
      jest.spyOn(UserModel, 'findByIdAndDelete').mockResolvedValue(mockUserData);
      const result = await UserDb.findByIdAndDelete(mockUserId);
      expect(result).toEqual(mockUserData);
    });
  });
});
