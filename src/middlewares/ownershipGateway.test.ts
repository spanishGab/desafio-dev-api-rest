import httpMocks from 'node-mocks-http';
import { ForbiddenAccountAccessError } from '../errors/businessError';
import { OwnerService } from '../services/owner';

import { OwnershipGateway } from './ownershipGateway';

describe('#ownershipGateway.verifyAccountOwnership.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('Should grant owner access to the account', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    request.params.id = '1';
    request.query.documentNumber = '19777965087';

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const result = await OwnershipGateway.verifyAccountOwnership(request, response, () => {
      expect(request.accountId).toBe(Number(request.params.id));
      expect(request.ownerDocumentNumber).toBe(request.query.documentNumber);

      console.info("I'm Authorized :)");
    });

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      request.query.documentNumber,
      Number(request.params.id),
    );
    expect(result).toBe(true);
  });

  it('Should refuse owner access to the account', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    request.params.id = '1';
    request.query.documentNumber = '19777965087';

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(false);

    try {
      await OwnershipGateway.verifyAccountOwnership(request, response, () => {
        throw new Error('Should not reach here');
      });
      throw new Error('Should not reach here');
    } catch (error) {
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
        request.query.documentNumber,
        Number(request.params.id),
      );

      expect(error).toStrictEqual(ForbiddenAccountAccessError);
    }

  });
});
