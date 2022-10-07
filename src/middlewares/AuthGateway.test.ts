import httpMocks from 'node-mocks-http';
import { BlockedAccountError, ForbiddenAccountAccessError } from '../errors/businessError';
import { AccountService } from '../services/account';
import { OwnerService } from '../services/owner';

import { AuthGateway } from './AuthGateway';

describe('#AuthGateway.main.SuiteTests', () => {
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

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const result = await AuthGateway.main(request, response, () => {
      expect(request.accountId).toBe(Number(request.params.id));
      expect(request.ownerDocumentNumber).toBe(request.query.documentNumber);

      console.info("I'm Authorized!");
    });

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      request.query.documentNumber,
      Number(request.params.id),
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(Number(request.params.id));

    expect(result).toBe(true);
  });

  it('Should refuse owner access to the account due to denied account access', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    request.params.id = '1';
    request.query.documentNumber = '19777965087';

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(false);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    try {
      await AuthGateway.main(request, response, () => {
        throw new Error('Should not reach here');
      });
      throw new Error('Should not reach here');
    } catch (error) {
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
        request.query.documentNumber,
        Number(request.params.id),
      );

      expect(isAccountBlockedSpy).not.toHaveBeenCalled();

      expect(error).toStrictEqual(ForbiddenAccountAccessError);
    }
  });

  it('Should refuse owner access to the account due to account block', async () => {
    const request = httpMocks.createRequest();
    const response = httpMocks.createResponse();

    request.params.id = '1';
    request.query.documentNumber = '19777965087';

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(true);

    try {
      await AuthGateway.main(request, response, () => {
        throw new Error('Should not reach here');
      });
      throw new Error('Should not reach here');
    } catch (error) {
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
      expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
        request.query.documentNumber,
        Number(request.params.id),
      );

      expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
      expect(isAccountBlockedSpy).toHaveBeenCalledWith(Number(request.params.id));

      expect(error).toStrictEqual(BlockedAccountError);
    }
  });
});
