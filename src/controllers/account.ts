import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import props from '../common/props';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import {
  accountCreationSchema,
  accountOperationSchema,
  accountRecoverySchema,
  transactionStatementSchema,
} from '../schemas/account';
import {
  AccountOperationService,
  AccountService,
  AccountType,
  IAccount,
  IPaginatedAccountOperationInfo,
  NewAccount,
  OperationType,
} from '../services/account';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';
import { Endpoints } from '../routes/external.routes';

export interface IAccountRequestBody {
  accountInformation: {
    type: AccountType;
    balance: number;
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
      type: inputData.accountInformation.type,
      isActive: true,
    };

    const { id } = await accountService.createNew(
      accountData,
      inputData.ownersDocumentNumbers,
    );

    return res
      .status(StatusCodes.CREATED)
      .header({ location: `/${props.VERSION}${Endpoints.recoverAccount.replace(/:.*/, id.toString())}` })
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
      event: 'AccountController.recover.init',
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
      event: 'AccountController.deposit.init',
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

    await accountService.alterBalance(
      req.accountId!,
      amount,
      OperationType.credit,
    );

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
    });
  }

  static async withdrawal(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.withdrawal.init',
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

    await accountService.alterBalance(
      req.accountId!,
      amount,
      OperationType.debit,
    );

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
    });
  }

  static async block(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.block.init',
      details: {
        accountId: req.accountId,
        ownerDocumentNumber: req.ownerDocumentNumber,
      },
    });

    const accountService = new AccountService();

    await accountService.deactivate(req.accountId!);

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
    });
  }

  static async getTransactionStatement(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'AccountController.getTransactionStatement.init',
      details: {
        accountId: req.accountId,
        ownerDocumentNumber: req.ownerDocumentNumber,
        inputData: req.query,
      },
    });

    const { period, page, itemsPerPage } =
      await Validator.validateFieldsBySchema<{
        period: number;
        page: number;
        itemsPerPage: number;
      }>(req.query, transactionStatementSchema);

    const accountOperationService = new AccountOperationService();

    const transactionStatement: IPaginatedAccountOperationInfo =
      await accountOperationService.paginatedlyFindMany(
        req.accountId!,
        period,
        page,
        itemsPerPage,
      );

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
      content: transactionStatement,
    });
  }
}
