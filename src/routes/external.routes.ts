import { Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { AccountController } from '../controllers/account';
import { OwnerController } from '../controllers/owner';

import { ISuccessResponseBody } from '../interfaces/response';
import { AuthGateway } from '../middlewares/AuthGateway';
import logger from '../utils/Logger';

const router = Router();

export enum Endpoints {
  healthcheck = '/healthcheck',
  recoverOwner = '/recover-owner/:documentNumber',
  createOwner = '/create-owner',
  createAccount = '/',
  recoverAccount = '/:id',
  accountDeposit = '/deposit/:id',
  accountWithdrawal = '/withdrawal/:id',
  accountBlocking = '/block/:id',
  accountStatement = '/statement/:id',
}


router.get(
  Endpoints.healthcheck,
  (req: Request, res: Response<ISuccessResponseBody>): Response => {
    logger.info({
      event: 'routes.healthCheck',
      details: { message: 'System is Healthy' },
    });

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
    });
  },
);

// Account owner functionalities
router.get(Endpoints.recoverOwner, OwnerController.recover);

router.post(Endpoints.createOwner, OwnerController.create);

// Account operation functionalities
router.post(Endpoints.createAccount, AccountController.create);

router.get(Endpoints.recoverAccount, AuthGateway.main, AccountController.recover);

router.put(Endpoints.accountDeposit, AuthGateway.main, AccountController.deposit);

router.put(Endpoints.accountWithdrawal, AuthGateway.main, AccountController.withdrawal);

router.put(Endpoints.accountBlocking, AuthGateway.main, AccountController.block);

router.get(
  Endpoints.accountStatement,
  AuthGateway.main,
  AccountController.getTransactionStatement,
);

export default router;
