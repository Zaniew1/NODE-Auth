import { PrismaClient } from "@prisma/client";
import { DatabaseInterface } from "../../types/types";
const prisma = new PrismaClient();

export class PrismaDatabase implements DatabaseInterface {
  constructor() {}

  public async create(table: TableType, data: object) {
    const prismaModel = prisma[table] as any;
    return await prismaModel.create(data);
  }
  public async update(table: TableType, data: object) {
    const prismaModel = prisma[table] as any;
    return await prismaModel.update({
      data: data,
    });
  }
  public async delete(table: TableType, id: number) {
    try {
      const prismaModel = prisma[table] as any;
      return await prismaModel.delete({
        where: {
          id: id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
  public async findById(table: TableType, id: number) {
    try {
      const prismaModel = prisma[table] as any;
      return await prismaModel.findUnique({
        where: {
          id: id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
  public async findMany(table: TableType) {
    try {
      const prismaModel = prisma[table] as any;
      return await prismaModel.findMany({});
    } catch (e) {
      console.log(e);
    }
  }
  public async findBy(table: TableType, data: object) {
    try {
      const prismaModel = prisma[table] as any;
      return await prismaModel.findUnique({
        where: data,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
