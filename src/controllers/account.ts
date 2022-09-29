import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import props from '../common/props';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import {
  accountCreationSchema,
  accountOperationSchema,
  accountRecoverySchema,
} from '../schemas/account';
import {
  AccountService,
  AccountType,
  IAccount,
  NewAccount,
  TransactionType,
} from '../services/account';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IAccountRequestBody {
  accountInformation: {
    type: AccountType;
    balance: number;
    dailyWithdrawalLimit: number;
  };
  ownersDocumentNumbers: string[];
}

export class AccountController {
  static async create(
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
      inputData.ownersDocumentNumbers,
    );

    return res
      .status(StatusCodes.CREATED)
      .header({ location: `/${props.VERSION}/account/${id}` })
      .json({
        uuid: RequestContextManager.getRequestId(),
        message: 'Created Account!',
      });
  }

  static async recover(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.recoverAccount',
      details: {
        accountId: req.accountId,
        ownerDocumentNumber: req.ownerDocumentNumber,
      },
    });

    const accountService = new AccountService();

    const accountData: IAccount = await accountService.findOne(req.accountId!);

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
      content: {
        ...accountData,
      },
    });
  }

  static async deposit(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.deposit',
      details: {
        accountId: req.accountId,
        ownerDocumentNumber: req.ownerDocumentNumber,
        inputData: req.body,
      },
    });

    const { amount } = await Validator.validateFieldsBySchema<{
      amount: number;
    }>(req.body, accountOperationSchema);

    const accountService = new AccountService();

    accountService.alterBalance(req.accountId!, amount, TransactionType.credit);

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
    });
  }
}
