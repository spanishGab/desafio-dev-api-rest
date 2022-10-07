import { NextFunction, Request, Response } from 'express';
import { BlockedAccountError, ForbiddenAccountAccessError } from '../errors/businessError';
import { accountRecoverySchema } from '../schemas/account';
import { ownerRecoverySchema } from '../schemas/owner';
import { AccountService } from '../services/account';
import { OwnerService } from '../services/owner';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export class AuthGateway {
  static async main(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<boolean> {
    logger.info({
      event: 'AuthGateway.main.init',
      details: {
        params: req.params,
        query: req.query,
      },
    });

    const { id: accountId } = await Validator.validateFieldsBySchema<{
      id: number;
    }>(req.params, accountRecoverySchema);

    const { documentNumber: ownerDocumentNumber } =
      await Validator.validateFieldsBySchema<{ documentNumber: string }>(
        req.query,
        ownerRecoverySchema,
      );

    await AuthGateway.checkAccountOwnerAccess(accountId, ownerDocumentNumber);
    await AuthGateway.checkAccountBlock(accountId);

    req.ownerDocumentNumber = ownerDocumentNumber;
    req.accountId = accountId;

    next();

    return true;
  }

  private static async checkAccountOwnerAccess(
    accountId: number,
    ownerDocumentNumber: string,
  ): Promise<void> {
    logger.info({
      event: 'AuthGateway.checkAccountOwnerAccess',
      details: {
        accountId,
        ownerDocumentNumber,
      },
    });

    const ownerService = new OwnerService();

    if (
      !await ownerService.isAccountOwnerAuthorized(
        ownerDocumentNumber,
        accountId,
      )
    ) {
      logger.warn({
        event: 'AuthGateway.checkAccountOwnerAccess.forbidden',
        details: 'Owner has no permission to access account',
      });

      throw ForbiddenAccountAccessError;
    }

  }

  private static async checkAccountBlock(accountId: number): Promise<void> {
    logger.info({
      event: 'AuthGateway.checkAccountBlock',
      details: { accountId },
    });

    const accountService = new AccountService();

    if (await accountService.isBlocked(accountId)) {
      logger.warn({
        event: 'AuthGateway.checkAccountBlock.blocked',
        details: 'Account has is blocked',
      });

      throw BlockedAccountError;
    }
  }
}
