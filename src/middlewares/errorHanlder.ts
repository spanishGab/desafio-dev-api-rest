import { Request, Response, NextFunction } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import logger from '../utils/Logger';

export interface IErrorDetails {
  attribute: string;
  messages: string[];
}

export interface IErrorResponseBody {
  id: string;
  code: string;
  description: string;
  errorDetails?: IErrorDetails[];
}

export function handleError(
  err: Error,
  req: Request,
  res: Response<IErrorResponseBody>,
  next: NextFunction,
) {
  logger.info('errorHandler', 'handleError', err.message);

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
