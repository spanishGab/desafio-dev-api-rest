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
  logger.info('errorHandler', 'handleError', err.message);

  if (err instanceof RequestError) {
    const errorResponse = err.toJSON();
    
    logger.error('errorHandler', 'handleError', errorResponse);

    return res.status(err.httpStatusCode).json(errorResponse as IErrorResponseBody);
  }

  if (err instanceof SyntaxError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      id: req.id,
      code: String(StatusCodes.BAD_REQUEST),
      description: err.message,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    id: req.id,
    code: String(StatusCodes.INTERNAL_SERVER_ERROR),
    description: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
}
