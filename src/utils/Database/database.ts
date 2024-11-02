import { DatabaseInterface } from "../../types/types";
import { MongooseDatabase } from "./databaseMongoose";
// import { PrismaDatabase } from "./databasePrisma";
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

// export const DatabaseInstance = new Database(new PrismaDatabase());
export const DatabaseInstance = new Database(new MongooseDatabase());
