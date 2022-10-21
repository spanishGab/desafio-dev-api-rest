import { getSafeOffsetPaginationParams } from './pagination';

describe('#pagination.getSafeOffsetPaginationParams.SuiteTests', () => {
  test.each([
    {
      totalItems: 100,
      requestedPage: 19,
      itemsPerPage: 5,
      expectedResult: {
        offset: 95,
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
  ])(
    'It should retrieve a valid offset pagination parameters object',
    ({ totalItems, requestedPage, itemsPerPage, expectedResult }) => {
      expect(
        getSafeOffsetPaginationParams(totalItems, requestedPage, itemsPerPage),
      ).toStrictEqual(expectedResult);
    },
  );
});
