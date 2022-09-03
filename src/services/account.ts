import { Prisma, Account } from '@prisma/client';

import { DateTime } from 'luxon';
import { AccountCreationError } from '../errors/businessError';
import dbClient from '../db';
import logger from '../utils/Logger';

export enum AccountType {
  corrente = 'corrente',
  poupanca = 'poupanca',
  salario = 'salario',
  conjunta = 'conjunta',
}

export interface IAccount {
  id: number;
  ownerId: number;
  balance: number;
  dailyWithdrawalLimit: number;
  isActive: boolean;
  type: AccountType;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export type NewAccount = Omit<IAccount, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;

export class AccountService {
  public async createNew(
    accountData: NewAccount,
    ownerDocumentNumber: string,
  ): Promise<IAccount> {
    logger.info({
      event: 'AccountService.createNew.init',
      details: { accountData: accountData, ownerDocumentNumber },
    });

    try {
      const { id: accountOwnerId } =
        await dbClient.owner.findUniqueOrThrow({
          where: { documentNumber: ownerDocumentNumber },
          select: {
            id: true,
          },
        });

      const createdAccount: Account = await dbClient.account.create({
        data: { ownerId: accountOwnerId, ...accountData },
        select: {
          id: true,
          ownerId: true,
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
            message: 'Could not find a owner for the given ownerDocumetNumber',
            error: error.message,
            ownerDocumentNumber,
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
