import { PrismaClient, Prisma, Account, Person } from '@prisma/client';
import { AccountCreationError } from '../errors/businessError';
import logger from '../utils/Logger';

export enum AccountType {
  corrente = 'corrente',
  poupanca = 'poupanca',
  salario = 'salario',
  conjunta = 'conjunta',
}

export class AccountService {
  private dbClient = new PrismaClient();

  public async createNew(
    accountInfo: Omit<Account, 'id' | 'personId' | 'createdAt' | 'updatedAt'>,
    ownerDocumentNumber: string,
  ): Promise<Account> {
    logger.info({
      event: 'AccountService.createNew.init',
      details: { accountData: accountInfo, ownerDocumentNumber },
    });

    try {
      const { id: accountOwnerId } =
        await this.dbClient.person.findUniqueOrThrow({
          where: { documentNumber: ownerDocumentNumber },
          select: {
            id: true,
          },
        });

      const createdAccount = await this.dbClient.account.create({
        data: { personId: accountOwnerId, ...accountInfo },
        select: {
          id: true,
          personId: true,
          balance: true,
          dailyWithdrawalLimit: true,
          isActive: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return createdAccount;
    } catch (error) {
      if (error instanceof Prisma.NotFoundError) {
        logger.error({
          event: 'AccountService.createNew.ownerNotFound.error',
          details: {
            message: 'Could not find a person for the given ownerDocumetNumber',
            error: error.message,
            ownerDocumentNumber,
          },
        });
      }

      logger.error({
        event: 'AccountService.createNew.error',
        details: {
          message: 'An error occoured while trying to create the new account',
          error: error.message,
        },
      });

      throw AccountCreationError;
    }

  }
}
