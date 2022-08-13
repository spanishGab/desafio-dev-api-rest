import { Request, Response, Router } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { ISuccessResponseBody } from '.';
import logger from '../utils/Logger';

const router = Router();

router.get(`/healthcheck`, (req: Request, res: Response): Response => {
  logger.info('routes', 'healthcheck', {
    message: 'System is Healthy',
  });

  return res.status(StatusCodes.OK).json({
    uuid: req.id,
    message: ReasonPhrases.OK,
  } as ISuccessResponseBody);
});

router.post(`/`);

router.post(`/deposit`);

router.get(`/balance`);

router.post(`/withdrawal`);

router.put(`/block-account`);

router.get(`/receipt`);

export default router;