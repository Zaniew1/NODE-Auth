import { Prisma, User } from '@prisma/client';
import prisma from '../../prisma/prismaClient';
import { hashPassword } from '../helpers/PasswordManage';

export interface PrismaUserClassType {
  existsByEmail(email: string): Promise<string | null>;
  create(data: { name: string; surname?: string | null; email: string; password: string; userAgent?: string | null }): Promise<User>;
  findOneByMail(email: string): Promise<User | null>;
  findByIdAndUpdate(id: string, properties: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByIdAndDelete(id: string): Promise<User | null>;
}

export default class PrismaUserClass implements PrismaUserClassType {
  async existsByEmail(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return user?.id ?? null;
  }

  async create(data: { name: string; surname?: string | null; email: string; password: string; userAgent?: string | null }): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    return await prisma.user.create({ data: { ...data, password: hashedPassword } });
  }

  async findOneByMail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findByIdAndUpdate(id: string, properties: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    try {
      return await prisma.user.update({ where: { id }, data: properties });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findByIdAndDelete(id: string): Promise<User | null> {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }
}
