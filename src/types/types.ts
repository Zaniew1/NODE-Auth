import { UserType } from "../utils/zodSchemas/registerSchema";

export interface DatabaseInterface {
  create(table: TableType, data: object): Promise<UserType>;
  update(table: TableType, data: object): Promise<void | object>;
  delete(table: TableType, id: number): Promise<void | object>;
  findBy(table: TableType, data: object): Promise<void | object>;
  findMany(table: TableType): Promise<void | object>;
  findById(table: TableType, id: number): Promise<void | object>;
}
