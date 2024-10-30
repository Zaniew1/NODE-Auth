import { UserType } from "./zodSchemas/userSchema";
import { PrismaClient } from "@prisma/client";

const Table = {
  enterprise: Symbol("enterprise"),
  department: Symbol("department"),
  worker: Symbol("worker"),
  training: Symbol("training"),
  user: Symbol("user"),
};

type TableType = keyof typeof Table;

const prisma = new PrismaClient();

interface DatabaseInterface {
  create(table: TableType, data: object): Promise<UserType>;
  update(table: TableType, data: object): Promise<void | object>;
  delete(table: TableType, id: number): Promise<void | object>;
  findBy(table: TableType, data: object): Promise<void | object>;
  findMany(table: TableType): Promise<void | object>;
  findById(table: TableType, id: number): Promise<void | object>;
}

class Database implements DatabaseInterface {
  private databaseInstance;
  constructor(databaseInstance: DatabaseInterface) {
    this.databaseInstance = databaseInstance;
  }
  public create(table: TableType, data: object) {
    return this.databaseInstance.create(table, data);
  }
  public update(table: TableType, data: object) {
    return this.databaseInstance.update(table, data);
  }
  public delete(table: TableType, id: number) {
    return this.databaseInstance.delete(table, id);
  }
  public findById(table: TableType, id: number) {
    return this.databaseInstance.findById(table, id);
  }
  public findMany(table: TableType) {
    return this.databaseInstance.findMany(table);
  }
  public findBy(table: TableType, data: object) {
    return this.databaseInstance.findBy(table, data);
  }
}

class PrismaDatabase implements DatabaseInterface {
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
export const DatabaseInstance = new Database(new PrismaDatabase());
