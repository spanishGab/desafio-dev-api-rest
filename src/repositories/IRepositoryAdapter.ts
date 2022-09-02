export default interface IRepositoryAdapter<
  Table = any,
  SelectColumns = Record<keyof Table, boolean>,
  InsertColumns = Record<keyof Table, boolean>,
  WhereFilter = Record<keyof Table, any>
> {
  dbClient: string;

  create(data: Table, select?: SelectColumns, insert?: InsertColumns): Table;
  read(where: WhereFilter, select?: SelectColumns, insert?: InsertColumns): Table;
  update(where: WhereFilter, select?: SelectColumns, insert?: InsertColumns): Table;
  delete(where: WhereFilter, select?: SelectColumns, insert?: InsertColumns): Table;
}
