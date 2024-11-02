import mongoose from "mongoose";
import { DatabaseInterface } from "../../types/types";
const mongooseModel = new mongoose.Mongoose();
export class MongooseDatabase implements DatabaseInterface {
  constructor() {}

  public async create(table: TableType, data: object) {}
  public async update(table: TableType, data: object) {}
  public async delete(table: TableType, id: number) {}
  public async findById(table: TableType, id: number) {}
  public async findMany(table: TableType) {
    return await mongooseModel.find({ name: "john", age: { $gte: 18 } }).exec();
  }
  public async findBy(table: TableType, data: object) {}
}
