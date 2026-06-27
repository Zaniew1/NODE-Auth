import { Prisma, VerificationCode } from '@prisma/client';
import prisma from '../../prisma/prismaClient';
import { VerificationCodeType } from '../../types/verificationCodeManage';
import { fiveMinutesAgo } from '../helpers/date';

export interface PrismaVerificationCodeClassType {
  create(data: { userId: string; type: VerificationCodeType; expiresAt: Date }): Promise<VerificationCode>;
  findByIdAndDelete(id: string): Promise<VerificationCode | null>;
  findUsersCodes(userId: string, type: VerificationCodeType): Promise<number>;
  findOneByIdAndType(id: string, type: string): Promise<VerificationCode | null>;
}

export default class PrismaVerificationCodeClass implements PrismaVerificationCodeClassType {
  async create(data: { userId: string; type: VerificationCodeType; expiresAt: Date }): Promise<VerificationCode> {
    return await prisma.verificationCode.create({ data });
  }

  async findByIdAndDelete(id: string): Promise<VerificationCode | null> {
    try {
      return await prisma.verificationCode.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }

  async findUsersCodes(userId: string, type: VerificationCodeType): Promise<number> {
    return await prisma.verificationCode.count({
      where: { userId, type, createdAt: { gt: fiveMinutesAgo() } },
    });
  }

  async findOneByIdAndType(id: string, type: string): Promise<VerificationCode | null> {
    return await prisma.verificationCode.findFirst({
      where: { id, type, expiresAt: { gt: new Date() } },
    });
  }
}
