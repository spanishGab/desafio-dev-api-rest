import { PaginationUtils } from './pagination';

describe('#PaginationUtils.getSafeOffsetPaginationInfo.SuiteTests', () => {
  test.each([
    {
      totalItems: 100,
      requestedPage: 19,
      itemsPerPage: 5,
      expectedResult: {
        offset: 90,
        limit: 5,
        totalPages: 20
      },
    },
    {
      totalItems: 100,
      requestedPage: 2,
      itemsPerPage: 5,
      expectedResult: {
        offset: 5,
        limit: 5,
        totalPages: 20
      },
    },
    {
      totalItems: 100,
      requestedPage: 101,
      itemsPerPage: 5,
      expectedResult: {
        offset: 95,
        limit: 5,
        totalPages: 20
      },
    },
    {
      totalItems: 5,
      requestedPage: 1,
      itemsPerPage: 5,
      expectedResult: {
        offset: 0,
        limit: 5,
        totalPages: 1
      },
    },
    {
      totalItems: 5,
      requestedPage: 1,
      itemsPerPage: 6,
      expectedResult: {
        offset: 0,
        limit: 5,
        totalPages: 1
      },
    },
    {
      totalItems: 6,
      requestedPage: 2,
      itemsPerPage: 2,
      expectedResult: {
        offset: 2,
        limit: 2,
        totalPages: 3
      },
    },
    {
      totalItems: 0,
      requestedPage: 2,
      itemsPerPage: 2,
      expectedResult: {
        offset: 0,
        limit: 0,
        totalPages: 0
      },
    },
    {
      totalItems: 6,
      requestedPage: 1,
      itemsPerPage: 6,
      expectedResult: {
        offset: 0,
        limit: 6,
        totalPages: 1
      },
    },
  ])(
    'It should retrieve a valid offset pagination parameters object',
    ({ totalItems, requestedPage, itemsPerPage, expectedResult }) => {
      expect(
        PaginationUtils.getSafeOffsetPaginationInfo(totalItems, requestedPage, itemsPerPage),
      ).toStrictEqual(expectedResult);
    },
  );
});
