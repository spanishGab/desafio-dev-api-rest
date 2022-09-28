import { NextFunction, Request, Response } from 'express';
import { ForbiddenAccountAccessError } from '../errors/businessError';
import { accountRecoverySchema } from '../schemas/account';
import { ownerRecoverySchema } from '../schemas/owner';
import { OwnerService } from '../services/owner';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export class OwnershipGateway {
  static async verifyAccountOwnership(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<boolean> {
    logger.info({
      event: 'ownershipGateway.verifyAccountOwnership.init',
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

    const ownerService = new OwnerService();

    if (
      await ownerService.isAccountOwnerAuthorized(
        ownerDocumentNumber,
        accountId,
      )
    ) {
      req.ownerDocumentNumber = ownerDocumentNumber;
      req.accountId = accountId;

      next();

      return true;
    }

    logger.info({
      event: 'ownershipGateway.verifyAccountOwnership.forbidden',
      details: 'Owner has no permission to access account',
    });

    throw ForbiddenAccountAccessError;
  }
}
