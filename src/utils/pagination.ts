export class PaginationUtils {
  static getSafeOffsetPaginationParams(
    totalItems: number,
    requestedPage: number,
    itemsPerPage: number,
  ): {
    offset: number;
    limit: number;
  } {
    const reindexedPage = requestedPage - 1; // reindexing pagination for 1 based index

    const totalPages = parseInt(
      Math.ceil(totalItems / itemsPerPage).toFixed(0),
      10,
    );

    return {
      offset:
        reindexedPage < totalPages
          ? reindexedPage * itemsPerPage
          : (totalPages - 1) * itemsPerPage,
      limit: itemsPerPage <= totalItems ? itemsPerPage : totalItems,
    };
  }
}
