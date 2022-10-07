import { Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { AccountController } from '../controllers/account';
import { OwnerController } from '../controllers/owner';

import { ISuccessResponseBody } from '../interfaces/response';
import { AuthGateway } from '../middlewares/AuthGateway';
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
router.get('/recover-owner/:documentNumber', OwnerController.recover);

router.post('/create-owner', OwnerController.create);

// Account operation functionalities
router.post('/', AccountController.create);

router.get('/:id', AuthGateway.main, AccountController.recover);

router.put('/deposit/:id', AuthGateway.main, AccountController.deposit);

router.put('/withdrawal/:id', AuthGateway.main, AccountController.withdrawal);

router.put('/block/:id', AuthGateway.main, AccountController.block);

router.get('/receipt/:id');

export default router;
