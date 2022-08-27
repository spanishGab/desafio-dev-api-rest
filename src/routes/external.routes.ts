import { Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { AccountController } from '../controllers/account';

import { ISuccessResponseBody } from '../interfaces/response';
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

router.post('/', AccountController.createAccount);

router.get('/account/:id');

router.post('/deposit');

router.get('/balance');

router.post('/withdrawal');

router.put('/block-account');

router.get('/receipt');

export default router;
