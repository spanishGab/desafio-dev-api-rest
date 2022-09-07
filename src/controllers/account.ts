import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import props from '../common/props';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import { accountCreationSchema } from '../schemas/account';
import { AccountService, AccountType, NewAccount } from '../services/account';
import CPF from '../utils/CPF';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IAccountRequestBody {
  ownerDocumentNumber: string;
  accountInformation: {
    type: AccountType;
    balance: number;
    dailyWithdrawalLimit: number;
  }
}

export class AccountController {
  static async createAccount(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.createAccount.init',
      details: { inputData: req.body },
    });

    const inputData: IAccountRequestBody =
      await Validator.validateFieldsBySchema(req.body, accountCreationSchema);

    const accountService = new AccountService();

    const accountData: NewAccount = {
      balance: inputData.accountInformation.balance,
      dailyWithdrawalLimit: inputData.accountInformation.dailyWithdrawalLimit,
      type: inputData.accountInformation.type,
      isActive: true,
    };

    const { id } = await accountService.createNew(
      accountData,
      new CPF(inputData.ownerDocumentNumber),
    );

    return res
      .status(StatusCodes.CREATED)
      .header({ location: `/${props.VERSION}/account/${id}` })
      .json({
        uuid: RequestContextManager.getRequestId(),
        message: 'Created Account!',
      });
  }
}
