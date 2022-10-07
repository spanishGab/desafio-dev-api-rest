import { Prisma, Account, Owner } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';

import { DateTime } from 'luxon';
import {
  AccountCreationError,
  AccountNotFoundError,
  InsuficientAccountBalanceError,
  WrongAccountTypeError,
} from '../errors/businessError';
import dbClient from '../db';
import logger from '../utils/Logger';
import { AccountServiceError } from '../errors/internalErrors';
import { DateUtils } from '../utils/date';

export const enum TransactionType {
  credit = 'CR',
  debit = 'DB',
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

export class AccountService {
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

      throw AccountServiceError;
    }
  }

  public async alterBalance(
    accountId: number,
    amount: number,
    operation: TransactionType,
  ): Promise<IAccount> {
    logger.info({
      event: `AccountService.alterBalance.${operation}`,
      details: { accountId, amount },
    });

    const { balance } = await this.findOne(accountId);

    const finalBalance =
      operation === TransactionType.debit ? balance - amount : balance + amount;

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
      return this.fromDBRecord(
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
    } catch (error) {
      logger.error({
        event: 'AccountService.alterBalance.error',
        details: {
          error: error.message || error,
        },
      });

      throw AccountServiceError;
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
