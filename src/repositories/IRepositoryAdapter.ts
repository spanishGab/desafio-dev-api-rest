import { Prisma, PrismaClient } from "@prisma/client";

export default interface IRepositoryAdapter<
  Table = any,
  SelectColumns = Record<keyof Table, boolean>,
  WhereFilter = Record<keyof Table, any>
> {
  client: PrismaClient;

  create(data: Table, select?: SelectColumns): Promise<Table>;
  read(where: WhereFilter, select?: SelectColumns): Table;
  update(where: WhereFilter, select?: SelectColumns): Table;
  delete(where: WhereFilter, select?: SelectColumns): Table;
  fromDBRecord(dbRecord: Table): any;
}
