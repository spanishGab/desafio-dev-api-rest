export interface IOffsetPaginationInfo {
  offset: number,
  limit: number,
  totalPages: number,
}

export class PaginationUtils {
  static getSafeOffsetPaginationInfo(
    totalItems: number,
    requestedPage: number,
    itemsPerPage: number,
  ): IOffsetPaginationInfo {
    const reindexedPage = requestedPage - 1; // reindexing pagination for 1 based index

    const totalPages = parseInt(
      Math.ceil(totalItems / itemsPerPage).toFixed(0),
      10,
    );

    const paginationParams: IOffsetPaginationInfo = {
      offset: 0,
      limit: itemsPerPage <= totalItems ? itemsPerPage : totalItems,
      totalPages,
    };

    if (totalPages > 0) {
      if (reindexedPage < totalPages) {
        paginationParams.offset = reindexedPage * itemsPerPage

      } else {
        paginationParams.offset = (totalPages - 1) * itemsPerPage
      }
    }

    return paginationParams;
  }
}
