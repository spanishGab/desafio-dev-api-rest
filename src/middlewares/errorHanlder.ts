import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { RequestError } from '../errors/requestErrors';
import { IErrorResponseBody } from '../interfaces/response';
import logger from '../utils/Logger';

export function handleError(
  err: Error,
  req: Request,
  res: Response<IErrorResponseBody>,
  next: NextFunction,
) {
  if (err instanceof RequestError) {
    logger.error({
      event: 'errorHandler.handleError.RequestError',
      details: { error: err },
    });

    return res
      .status(err.httpStatusCode)
      .json(err.toJSON() as IErrorResponseBody);
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
