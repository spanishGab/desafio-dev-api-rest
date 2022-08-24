import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import { accountCreationSchema } from '../schemas/account';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IAccountRequestBody {
  documentNumber: string;
  type: 'corrente' | 'poupanca' | 'salario' | 'conjunta';
  dailyWithdrawalLimit: number;
}

export class AccountController {
  static async createAccount(req: Request, res: Response): Promise<Response> {
    logger.info(AccountController.name, 'createAccount.init', {
      inputData: req.body,
    });

    const inputData: IAccountRequestBody =
      await Validator.validateFieldsBySchema(req.body, accountCreationSchema);

    return res
      .status(StatusCodes.CREATED)
      .json({
        uuid: RequestContextManager.getRequestId(),
        message: 'Created Account!',
      } as ISuccessResponseBody);
  }
}