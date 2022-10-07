import { Prisma, Account, Owner, Operation } from '@prisma/client';

import { DateTime } from 'luxon';
import {
  AccountBalanceAlterationError,
  AccountCreationError,
  AccountDeactivationError,
  AccountNotFoundError,
  AccountOperationCreationError,
  AccountRecoveryError,
  InsuficientAccountBalanceError,
  WrongAccountTypeError,
} from '../errors/businessError';
import dbClient from '../db';
import logger from '../utils/Logger';
import { DateUtils } from '../utils/date';

export const enum OperationType {
  credit = 'deposit',
  debit = 'withdrawal',
}

export const enum AccountType {
  corrente = 'corrente',
  poupanca = 'poupanca',
  salario = 'salario',
  conjunta = 'conjunta',
}

export interface IAccount {
  id: number;
  balance: number;
  dailyWithdrawalLimit: number;
  isActive: boolean;
  type: AccountType;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export type NewAccount = Omit<
  IAccount,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt'
>;

export interface IOperation {
  id: number;
  accountId: number;
  amount: number;
  type: OperationType;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class AccountService {
  constructor(
    private readonly operationService: AccountOperationService = new AccountOperationService(),
  ) {}

  public async createNew(
    accountData: NewAccount,
    ownersDocumentNumbers: string[],
  ): Promise<IAccount> {
    logger.info({
      event: 'AccountService.createNew.init',
      details: { accountData: accountData, ownersDocumentNumbers },
    });

    const ownersSafeGuard = new Set(ownersDocumentNumbers);

    if (
      (accountData.type !== AccountType.conjunta && ownersSafeGuard.size > 1) ||
      (accountData.type === AccountType.conjunta && ownersSafeGuard.size === 1)
    ) {
      logger.warn({
        event: 'AccountService.createNew.wrongAccountType',
        details: { accountData: accountData, ownersDocumentNumbers },
      });
      throw WrongAccountTypeError;
    }

    try {
      const ownerIds = await dbClient.owner.findMany({
        where: {
          documentNumber: {
            in: ownersDocumentNumbers,
          },
        },
        select: {
          id: true,
        },
      });

      if (ownerIds.length === 0) {
        throw new Prisma.NotFoundError(
          'Could not find any owner for the given ownerDocumetNumbers',
        );
      }

      const createdAccount: Account = await dbClient.account.create({
        data: {
          ...accountData,
          accountOwners: {
            create: ownerIds.map(({ id }) => {
              return {
                owner: {
                  connect: {
                    id,
                  },
                },
              };
            }),
          },
        },
        select: {
          id: true,
          balance: true,
          dailyWithdrawalLimit: true,
          isActive: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.fromDBRecord(createdAccount);
    } catch (error) {
      if (error instanceof Prisma.NotFoundError) {
        logger.error({
          event: 'AccountService.createNew.ownerNotFound.error',
          details: {
            error: error.message,
            ownersDocumentNumbers,
          },
        });
      }

      logger.error({
        event: 'AccountService.createNew.error',
        details: {
          error: error.message,
        },
      });

      throw AccountCreationError;
    }
  }

  public async findOne(accountId: number): Promise<IAccount> {
    logger.info({ event: 'AccountService.findOne', details: { accountId } });

    try {
      const accountInfo: IAccount = this.fromDBRecord(
        await dbClient.account.findUniqueOrThrow({
          where: {
            id: accountId,
          },
        }),
      );

      return accountInfo;
    } catch (error) {
      if (error instanceof Prisma.NotFoundError) {
        logger.error({
          event: 'AccountService.findOne.accountNotFound.error',
          details: {
            error: error.message,
            accountId,
          },
        });

        throw AccountNotFoundError;
      }

      logger.error({
        event: 'AccountService.findOne.error',
        details: {
          error: error.message,
        },
      });

      throw AccountRecoveryError;
    }
  }

  public async alterBalance(
    accountId: number,
    amount: number,
    operation: OperationType,
  ): Promise<IAccount> {
    logger.info({
      event: `AccountService.alterBalance.${operation}`,
      details: { accountId, amount },
    });

    const { balance } = await this.findOne(accountId);

    const finalBalance =
      operation === OperationType.debit ? balance - amount : balance + amount;

    if (finalBalance < 0) {
      logger.error({
        event: 'AccountService.alterBalance.debit.error',
        details: {
          error: 'The given amount treapasses the account balance',
          finalBalance,
        },
      });

      throw InsuficientAccountBalanceError;
    }

    try {
      const updatedAccount = this.fromDBRecord(
        await dbClient.account.update({
          where: {
            id: accountId,
          },
          data: {
            balance: finalBalance,
            updatedAt: DateUtils.saoPauloNow().toJSDate(),
          },
        }),
      );

      await this.operationService.createNew(accountId, amount, operation);

      return updatedAccount;
    } catch (error) {
      logger.error({
        event: 'AccountService.alterBalance.error',
        details: {
          error: error.message,
        },
      });

      throw AccountBalanceAlterationError;
    }
  }

  public async deactivate(accountId: number): Promise<IAccount> {
    logger.info({
      event: 'AccountService.deactivate',
      details: { accountId },
    });

    try {
      return this.fromDBRecord(
        await dbClient.account.update({
          where: {
            id: accountId,
          },
          data: {
            isActive: false,
          },
        }),
      );
    } catch (error) {
      logger.error({
        event: 'AccountService.deactivate.error',
        details: {
          error: error.message,
        },
      });

      throw AccountDeactivationError;
    }
  }

  public async isBlocked(accountId: number): Promise<boolean> {
    logger.info({
      event: 'AccountService.isBlocked',
      details: { accountId },
    });

    const { isActive } = await this.findOne(accountId);

    if (isActive) {
      return false;
    }

    return true;
  }

  private fromDBRecord(accountRecord: Account): IAccount {
    return {
      ...accountRecord,
      balance: Number(accountRecord.balance),
      dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
      type: accountRecord.type as AccountType,
      createdAt: DateTime.fromJSDate(accountRecord.createdAt),
      updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
    };
  }
}

export class AccountOperationService {
  public async createNew(
    accountId: number,
    amount: number,
    type: OperationType,
  ): Promise<IOperation> {
    logger.info({
      event: 'AccountOperationService.createOperation',
      details: {
        accountId,
        amount,
        type,
      },
    });

    try {
      const operation: Operation = await dbClient.operation.create({
        data: {
          accountId,
          type,
          amount,
        },
      });

      return this.fromDBRecord(operation);
    } catch (error) {
      logger.error({
        event: 'AccountOperationService.createOperation.error',
        details: error.message,
      });

      throw AccountOperationCreationError;
    }
  }

  private fromDBRecord(operationRecord: Operation): IOperation {
    return {
      ...operationRecord,
      amount: Number(operationRecord.amount),
      type: operationRecord.type as OperationType,
      createdAt: DateTime.fromJSDate(operationRecord.createdAt),
      updatedAt: DateTime.fromJSDate(operationRecord.updatedAt),
    };
  }
}
