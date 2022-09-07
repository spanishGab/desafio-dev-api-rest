import { StatusCodes } from 'http-status-codes';
import { BaseInternalError } from './internalErrors';

const BUSINESS_ERROR_CODE = 'account-management-error::';

export class BusinessError extends BaseInternalError {
  public readonly code: string = BUSINESS_ERROR_CODE.concat('unmapped');
  public readonly httpStatusCode: number;

  constructor(code: string, description: string, httpStatusCode: StatusCodes) {
    super(description);

    this.code = BUSINESS_ERROR_CODE.concat(code);
    this.httpStatusCode = httpStatusCode;
  }
}

export const AccountCreationError = new BusinessError(
  'account-creation',
  'Error while trying to create the account',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const OwnerCreationError = new BusinessError(
  'owner-creation',
  'Error while trying to create the account Owner',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const OwnerNotFoundError = new BusinessError(
  'owner-not-found',
  'Owner not found',
  StatusCodes.NOT_FOUND,
);

