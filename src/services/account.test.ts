import { Account, prisma, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { prismaMock } from '../../prismaSingleton';
import {
  AccountCreationError,
  AccountNotFoundError,
  WrongAccountTypeError,
} from '../errors/businessError';
import { AccountServiceError } from '../errors/internalErrors';
import { AccountService, AccountType } from './account';

const ownerRecord = {
  id: 1,
  name: 'Vasily Korpof',
  documentNumber: '12345678910',
  birthDate: '1988-09-01',
};

const accountRecord: Account = {
  id: 1,
  balance: new Prisma.Decimal(500),
  dailyWithdrawalLimit: new Prisma.Decimal(500),
  isActive: true,
  type: 'corrente',
  createdAt: new Date(2022, 9, 1),
  updatedAt: new Date(2022, 9, 1),
};

const accountData = {
  balance: 500,
  dailyWithdrawalLimit: 500,
  isActive: true,
  type: AccountType.corrente,
};

const defaultAccountSelect = {
  id: true,
  balance: true,
  dailyWithdrawalLimit: true,
  isActive: true,
  type: true,
  createdAt: true,
  updatedAt: true,
}

describe('#AccountService.createNew.SuitTests', () => {

  it('Should create a new account record successfully in the database', async () => {
    prismaMock.owner.findMany.calledWith({
      where: {
        documentNumber: {
          in: [ownerRecord.documentNumber],
        },
      },
      select: {
        id: true,
      },
    });

    prismaMock.owner.findMany.mockResolvedValue([ownerRecord]);

    prismaMock.account.create.calledWith({
      data: {
        ...accountData,
        accountOwners: {
          create: [{ id: ownerRecord.id }].map(({ id }) => {
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

    prismaMock.account.create.mockResolvedValue(accountRecord);

    const accountService = new AccountService();

    expect(
      accountService.createNew(accountData, [ownerRecord.documentNumber]),
    ).resolves.toStrictEqual({
      id: 1,
      balance: 500,
      dailyWithdrawalLimit: 500,
      isActive: true,
      type: AccountType.corrente,
      createdAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
      updatedAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
    });
  });

  test.each([
    {
      findOwnerMock: [ownerRecord],
      createAccountMock: undefined,
      mockedAccountData: {
        ...accountData,
        type: AccountType.salario,
      },
      mockedOwnersDocumentNumbers: [ownerRecord.documentNumber, '95418299026'],
      expectedResult: WrongAccountTypeError,
    },
    {
      findOwnerMock: [ownerRecord],
      createAccountMock: undefined,
      mockedAccountData: {
        ...accountData,
        type: AccountType.conjunta,
      },
      mockedOwnersDocumentNumbers: [ownerRecord.documentNumber],
      expectedResult: WrongAccountTypeError,
    },
    {
      findOwnerMock: [ownerRecord],
      createAccountMock: undefined,
      mockedAccountData: {
        ...accountData,
        type: AccountType.conjunta,
      },
      mockedOwnersDocumentNumbers: [ownerRecord.documentNumber, ownerRecord.documentNumber],
      expectedResult: WrongAccountTypeError,
    },
    {
      findOwnerMock: [],
      createAccountMock: undefined,
      mockedAccountData: accountData,
      mockedOwnersDocumentNumbers: [ownerRecord.documentNumber],
      expectedResult: AccountCreationError,
    },
    {
      findOwnerMock: [ownerRecord],
      createAccountMock: () => {
        throw new Error('Could not create the register on the database');
      },
      mockedAccountData: accountData,
      mockedOwnersDocumentNumbers: [ownerRecord.documentNumber],
      expectedResult: AccountCreationError,
    },
  ])(
    'AccountService.createNew() throwing errors',
    async ({
      findOwnerMock,
      createAccountMock,
      mockedAccountData,
      mockedOwnersDocumentNumbers,
      expectedResult,
    }) => {
      prismaMock.owner.findMany.mockResolvedValue(findOwnerMock);

      if (createAccountMock) {
        prismaMock.account.create.mockImplementationOnce(createAccountMock);
      } else {
        prismaMock.account.create.mockResolvedValue(accountRecord);
      }
      const accountService = new AccountService();

      try {
        await accountService.createNew(
          mockedAccountData,
          mockedOwnersDocumentNumbers,
        );
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});

describe('#AccountServce.findOne.SuiteTests', () => {
  it('Should find an account record successfully in the database', async () => {
    prismaMock.account.findUniqueOrThrow.calledWith({
      where: {
        id: accountRecord.id,
      },
      select: defaultAccountSelect,
    });

    prismaMock.account.findUniqueOrThrow.mockResolvedValue(accountRecord);

    const accountService = new AccountService();

    expect(accountService.findOne(accountRecord.id)).resolves.toStrictEqual(
      {
        id: accountRecord.id,
        balance: Number(accountRecord.balance),
        dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
        isActive: accountRecord.isActive,
        type: accountRecord.type,
        createdAt: DateTime.fromJSDate(accountRecord.createdAt),
        updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
      },
    );
  });

  test.each([
    {
      findAccountMock: () => {
        throw new Error('Error while connecting to database');
      },
      expectedResult: AccountServiceError,
    },
    {
      findAccountMock: () => {
        throw new Prisma.NotFoundError('Could not find any register on the database');
      },
      expectedResult: AccountNotFoundError,
    },
  ])(
    'findOne() throwing errors',
    async ({ findAccountMock, expectedResult }) => {
      prismaMock.account.findUniqueOrThrow.mockImplementationOnce(findAccountMock);

      const accountService = new AccountService();

      try {
        await accountService.findOne(accountRecord.id);
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});
