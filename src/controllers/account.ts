import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ISuccessResponseBody } from '../interfaces/response';
import { REQUEST_ID } from '../middlewares/RequestContextManager';
import { accountCreationSchema } from '../schemas/account';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IAccountRequestBody {
  name: string;
  documentNumber: string;
  birthDate: string;
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
      .json({ uuid: REQUEST_ID, message: 'Account Created!' } as ISuccessResponseBody);
  }
}
