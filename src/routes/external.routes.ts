import { Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { AccountController } from '../controllers/account';
import { OwnerController } from '../controllers/owner';

import { ISuccessResponseBody } from '../interfaces/response';
import { OwnershipGateway } from '../middlewares/ownershipGateway';
import logger from '../utils/Logger';

const router = Router();

router.get(
  '/healthcheck',
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
router.get('/recover-owner/:documentNumber', OwnerController.recoverAccountOwner);

router.post('/create-owner', OwnerController.createAccountOwner);

// Account operation functionalities
router.post('/', AccountController.createAccount);

router.get('/:id', OwnershipGateway.verifyAccountOwnership, AccountController.recoverAccount);

router.put('/deposit/:id');

router.post('/withdrawal/:id');

router.put('/block-account/:id');

router.get('/receipt/:id');

export default router;
