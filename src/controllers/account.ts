import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import { accountCreationSchema } from '../schemas/account';
import {
  AccountService,
  AccountType,
  IAccount,
  NewAccount,
} from '../services/account';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IAccountRequestBody {
  documentNumber: string;
  type: AccountType;
  balance: number;
  dailyWithdrawalLimit: number;
}

export class AccountController {
  static async createAccount(req: Request, res: Response): Promise<Response> {
    logger.info({
      event: 'AccountController.createAccount.init',
      details: { inputData: req.body },
    });

    const inputData: IAccountRequestBody =
      await Validator.validateFieldsBySchema(req.body, accountCreationSchema);

    const accountService = new AccountService();

    const accountData: NewAccount = {
      balance: inputData.balance,
      dailyWithdrawalLimit: inputData.dailyWithdrawalLimit,
      type: inputData.type,
      isActive: true,
    };

    const createdAccount = await accountService.createNew(
      accountData,
      inputData.documentNumber,
    );

    return res
      .status(StatusCodes.CREATED)
      .header({ Location: `/account/${createdAccount.id}` })
      .json({
        uuid: RequestContextManager.getRequestId(),
        message: 'Created Account!',
      } as ISuccessResponseBody);
  }
}
