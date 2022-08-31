import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { BusinessError } from '../errors/businessError';
import { BaseInternalError } from '../errors/internalErrors';
import { RequestError } from '../errors/requestErrors';
import { ICustomError } from '../interfaces/customError';
import logger from '../utils/Logger';

export function handleError(
  err: Error,
  req: Request,
  res: Response<ICustomError>,
  next: NextFunction,
) {
  if (err instanceof BusinessError) {
    logger.error({
      event: 'errorHandler.handleError.BusinessError',
      details: { error: err },
    });

    return res.status(err.httpStatusCode).json(err.toJSON());
  }

  if (err instanceof BaseInternalError) {
    logger.error({
      event: 'errorHandler.handleError.InternalError',
      details: { error: err },
    });

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.toJSON());
  }

  if (err instanceof RequestError) {
    logger.error({
      event: 'errorHandler.handleError.RequestError',
      details: { error: err },
    });

    return res.status(StatusCodes.BAD_REQUEST).json(err.toJSON());
  }

  if (err instanceof SyntaxError) {
    logger.error({
      event: 'errorHandler.handleError.SyntaxError',
      details: { error: err.message },
    });

    return res.status(StatusCodes.BAD_REQUEST).json({
      id: req.id,
      code: String(StatusCodes.BAD_REQUEST),
      description: err.message,
    });
  }

  logger.error({
    event: 'errorHandler.handleError.UnmappedError',
    details: { message: err.message },
  });

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    id: req.id,
    code: String(StatusCodes.INTERNAL_SERVER_ERROR),
    description: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
}
