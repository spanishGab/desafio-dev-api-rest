import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export enum AccountType {
  corrente = 'corrente',
  poupanca = 'poupanca',
  salario = 'salario',
  conjunta = 'conjunta',
}

export interface IAccount {
  id: number;
  personId: number;
  balance: Decimal;
  dailyWithdrawalLimit: Decimal;
  isActive: boolean;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

class AccountService {
  private dbClient = new PrismaClient();

  public async createNew(
    account: Omit<IAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IAccount> {
    // Revisar implementação
    const a = await this.dbClient.account.create(
      {
        data: account,
        select: {
          id: true,
          personId: true,
          balance: true,
          dailyWithdrawalLimit: true,
          isActive: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        }
      });

    return a as IAccount;
  }
}
