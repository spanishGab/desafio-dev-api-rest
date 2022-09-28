import { StatusCodes } from 'http-status-codes';
import { ICustomError } from '../interfaces/customError';

export class BaseInternalError
  extends Error
  implements Omit<ICustomError, 'id'>
{
  public readonly code: string = String(StatusCodes.INTERNAL_SERVER_ERROR);
  public readonly description: string;
  public readonly httpStatusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(description: string) {
    super();
    this.description = description;
  }

  public toJSON(): Omit<ICustomError, 'id'> {
    return {
      code: this.code,
      description: this.description,
    };
  }
}

export const AccountServiceError = new BaseInternalError(
  'An error occurred while performing an AccountService operation',
);

export const OwnerServiceError = new BaseInternalError(
  'An error occurred while performing an OwnerService operation',
);
