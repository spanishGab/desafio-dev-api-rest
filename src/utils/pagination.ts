export function getSafeOffsetPaginationParams(
  totalItems: number,
  requestedPage: number,
  itemsPerPage: number,
): {
  offset: number;
  limit: number;
} {
  const totalPages = parseInt(
    Math.ceil(totalItems / itemsPerPage).toFixed(0),
    10,
  );

  return {
    offset:
      requestedPage < totalPages
        ? requestedPage * itemsPerPage
        : (totalPages - 1) * itemsPerPage,
    limit: itemsPerPage <= totalItems ? itemsPerPage : totalItems,
  };
}
