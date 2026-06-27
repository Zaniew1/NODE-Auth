import { Prisma, Session } from '@prisma/client';
import prisma from '../../prisma/prismaClient';
import { thirtyDaysFromNow } from '../helpers/date';

export interface PrismaSessionClassType {
  create(data: { userId: string; userAgent?: string | null }): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  deleteManyByUserId(userId: string): Promise<number>;
  findSessionsByUserId(id: string): Promise<Session[]>;
  findByIdAndDelete(id: string): Promise<Session | null>;
  findByIdAndUpdate(id: string, properties: Partial<Omit<Session, 'id' | 'userId' | 'createdAt'>>): Promise<Session | null>;
}

export default class PrismaSessionClass implements PrismaSessionClassType {
  async create(data: { userId: string; userAgent?: string | null }): Promise<Session> {
    return await prisma.session.create({ data: { ...data, expiresAt: thirtyDaysFromNow() } });
  }

  async findById(id: string): Promise<Session | null> {
    return await prisma.session.findUnique({ where: { id } });
  }

  async deleteManyByUserId(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({ where: { userId } });
    return result.count;
  }

  async findSessionsByUserId(id: string): Promise<Session[]> {
    return await prisma.session.findMany({
      where: { userId: id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByIdAndDelete(id: string): Promise<Session | null> {
    try {
      return await prisma.session.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }

  async findByIdAndUpdate(id: string, properties: Partial<Omit<Session, 'id' | 'userId' | 'createdAt'>>): Promise<Session | null> {
    try {
      return await prisma.session.update({ where: { id }, data: properties });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }
}
