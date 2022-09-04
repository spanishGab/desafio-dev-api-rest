import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { prismaMock } from '../../prismaSingleton';
import { AccountCreationError } from '../errors/businessError';
import { AccountService, AccountType } from './account';

describe('#AccountService.createNew.SuitTests', () => {
  const ownerRecord = {
    id: 1,
    name: 'Vasily Korpof',
    documentNumber: '12345678910',
    birthDate: '1988-09-01',
  };

  const accountRecord = {
    id: 1,
    ownerId: 1,
    balance: new Prisma.Decimal(500),
    dailyWithdrawalLimit: new Prisma.Decimal(500),
    isActive: true,
    type: 'corrente',
    createdAt: new Date(2022, 9, 1),
    updatedAt: new Date(2022, 9, 1),
  };

  it('Should create a new account record successfully in the database', async () => {
    prismaMock.owner.findUniqueOrThrow.mockResolvedValue(ownerRecord);

    prismaMock.account.create.mockResolvedValue(accountRecord);

    const accountService = new AccountService();

    expect(
      accountService.createNew(
        {
          balance: 500,
          dailyWithdrawalLimit: 500,
          isActive: true,
          type: 'corrente' as AccountType,
        },
        '12345678910',
      ),
    ).resolves.toEqual({
      id: 1,
      ownerId: 1,
      balance: 500,
      dailyWithdrawalLimit: 500,
      isActive: true,
      type: 'corrente',
      createdAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
      updatedAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
    });
  });

  test.each([
    {
      findPersonMock: () => {
        throw new Error('Could not find a owner');
      },
      createAccountMock: undefined,
      expectedResult: AccountCreationError,
    },
    {
      findPersonMock: undefined,
      createAccountMock: () => {
        throw new Error('Could not create the register on the database');
      },
      expectedResult: AccountCreationError,
    },
  ])(
    'AccountService.createNew() throwing errors',
    async ({ findPersonMock, createAccountMock, expectedResult }) => {
      if (findPersonMock) {
        prismaMock.owner.findUniqueOrThrow.mockImplementationOnce(
          findPersonMock,
        );
      } else {
        prismaMock.owner.findUniqueOrThrow.mockResolvedValue(ownerRecord);
      }

      if (createAccountMock) {
        prismaMock.account.create.mockImplementationOnce(createAccountMock);
      } else {
        prismaMock.account.create.mockResolvedValue(accountRecord);
      }
      const accountService = new AccountService();

      try {
        await accountService.createNew(
          {
            balance: 500,
            dailyWithdrawalLimit: 500,
            isActive: true,
            type: 'corrente' as AccountType,
          },
          '12345678910',
        );
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});
