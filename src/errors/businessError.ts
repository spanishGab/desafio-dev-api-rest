import { StatusCodes } from 'http-status-codes';
import requestContextManager from '../middlewares/RequestContextManager';
import { BaseInternalError } from './internalErrors';

const BUSINESS_ERROR_CODE = 'account-management-error-';

class BusinessError extends BaseInternalError {
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
  'Error while trying to create a new account',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

