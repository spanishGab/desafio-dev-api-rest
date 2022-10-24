import { PaginationUtils } from './pagination';

describe('#PaginationUtils.getSafeOffsetPaginationParams.SuiteTests', () => {
  test.each([
    {
      totalItems: 100,
      requestedPage: 19,
      itemsPerPage: 5,
      expectedResult: {
        offset: 90,
        limit: 5,
      },
    },
    {
      totalItems: 100,
      requestedPage: 2,
      itemsPerPage: 5,
      expectedResult: {
        offset: 5,
        limit: 5,
      },
    },
    {
      totalItems: 100,
      requestedPage: 101,
      itemsPerPage: 5,
      expectedResult: {
        offset: 95,
        limit: 5,
      },
    },
    {
      totalItems: 5,
      requestedPage: 1,
      itemsPerPage: 5,
      expectedResult: {
        offset: 0,
        limit: 5,
      },
    },
    {
      totalItems: 5,
      requestedPage: 1,
      itemsPerPage: 6,
      expectedResult: {
        offset: 0,
        limit: 5,
      },
    },
    {
      totalItems: 6,
      requestedPage: 2,
      itemsPerPage: 2,
      expectedResult: {
        offset: 2,
        limit: 2,
      },
    },
  ])(
    'It should retrieve a valid offset pagination parameters object',
    ({ totalItems, requestedPage, itemsPerPage, expectedResult }) => {
      expect(
        PaginationUtils.getSafeOffsetPaginationParams(totalItems, requestedPage, itemsPerPage),
      ).toStrictEqual(expectedResult);
    },
  );
});
