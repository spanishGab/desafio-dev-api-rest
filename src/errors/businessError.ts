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

export const AccountRecoveryError = new BusinessError(
  'account-recovery',
  'Error while trying to find the account',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const AccountBalanceAlterationError = new BusinessError(
  'account-balance-alteration',
  'Error while trying to alter the account balance',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const AccountDeactivationError = new BusinessError(
  'account-deactivation',
  'Error while trying to deactivate the account',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const WrongAccountTypeError = new BusinessError(
  'wrong-account-type',
  "There is something wrong with the owners specified for this account type",
  StatusCodes.BAD_REQUEST,
);

export const AccountNotFoundError = new BusinessError(
  'account-not-found',
  'Account not found',
  StatusCodes.NOT_FOUND,
);

export const OwnerCreationError = new BusinessError(
  'owner-creation',
  'Error while trying to create the account owner',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const OwnerAlreadyExistsError = new BusinessError(
  'owner-exists',
  'There already exists an owner registered for the given documentNumber',
  StatusCodes.BAD_REQUEST,
);

export const OwnerNotFoundError = new BusinessError(
  'owner-not-found',
  'Account owner not found',
  StatusCodes.NOT_FOUND,
);

export const AccountOwnerAuthorizationError = new BusinessError(
  'account-owner-authorization',
  'Error while trying to authorize the account owner',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const ForbiddenAccountAccessError = new BusinessError(
  'forbidden-account-access',
  'Owner has no permission to access this account',
  StatusCodes.FORBIDDEN,
);

export const BlockedAccountError = new BusinessError(
  'blocked-account',
  'This account is currently blocked and cannot be used',
  StatusCodes.CONFLICT,
);

export const InsuficientAccountBalanceError = new BusinessError(
  'insucficient-account-balance',
  'Account has no balance to complete the transaction',
  StatusCodes.CONFLICT,
);

export const AccountOperationCreationError = new BusinessError(
  'account-operation-creation',
  'Error while trying to register the account operation',
  StatusCodes.INTERNAL_SERVER_ERROR,
);

export const AccountOperationRecoveryError = new BusinessError(
  'account-operation-recovery',
  "Error while trying to recover the account operation(s)",
  StatusCodes.INTERNAL_SERVER_ERROR,
)
