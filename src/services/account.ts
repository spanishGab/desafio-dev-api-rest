import { PrismaClient, Prisma, Account } from '@prisma/client';

export enum AccountType {
  corrente = 'corrente',
  poupanca = 'poupanca',
  salario = 'salario',
  conjunta = 'conjunta',
}

class AccountService {
  private dbClient = new PrismaClient();

  public async createNew(
    account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>,
    select: Record<keyof Account, boolean>,
  ): Promise<Account> {
    const createdAccount: Account = await this.dbClient.account.create(
      {
        data: account,
        select,
      });

    return createdAccount;
  }
}
