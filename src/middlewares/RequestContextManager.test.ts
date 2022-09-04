import httpMocks from 'node-mocks-http';
import {v4 as uuidV4} from 'uuid';

import RequestContextManager from './RequestContextManager';

jest.setTimeout(50000);

describe('#RequestContextManager.createContext.SuiteTests', () => {
  it('Should create a request context successfully', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();
    const expected = {
      requestId: uuidV4(), // cases where a random uuid is generated for the requestId
      correlationId: uuidV4(),
      returnedValue: true,
    };
    const result = RequestContextManager.createContext(request, response, () => {
      expect(typeof request.id).toBe(typeof expected.requestId);
      expect(request.id.length).toBe(expected.requestId.length);
    });

    expect(result).toBe(expected.returnedValue);
  });
});

describe('#RequestContextManager.getRequestId.SuiteTests', () => {
  test.each([
    {
      request: httpMocks.createRequest(),
      response: httpMocks.createResponse(),
      expected: uuidV4(), // cases where a random uuid is generated for the requestId
    },
  ])('getRequestId()', async ({request, response, expected}) => {
    RequestContextManager.createContext(request, response, () => {
      const result = RequestContextManager.getRequestId();

      expect(typeof result).toBe(typeof expected);
      expect(result.length).toBe(expected.length);
    });
  });
});
