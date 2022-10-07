import { Account, Operation, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { prismaMock } from '../../prismaSingleton';
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
import { DateUtils } from '../utils/date';
import {
  AccountOperationService,
  AccountService,
  AccountType,
  OperationType,
} from './account';

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
};

const operationRecord: Operation = {
  id: 1,
  accountId: accountRecord.id,
  amount: new Prisma.Decimal(50),
  type: 'withdrawal',
  createdAt: new Date(2022, 9, 1),
  updatedAt: new Date(2022, 9, 1),
};
describe('#AccountService.SuitTests', () => {
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
        mockedOwnersDocumentNumbers: [
          ownerRecord.documentNumber,
          '95418299026',
        ],
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
        mockedOwnersDocumentNumbers: [
          ownerRecord.documentNumber,
          ownerRecord.documentNumber,
        ],
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

      expect(accountService.findOne(accountRecord.id)).resolves.toStrictEqual({
        id: accountRecord.id,
        balance: Number(accountRecord.balance),
        dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
        isActive: accountRecord.isActive,
        type: accountRecord.type,
        createdAt: DateTime.fromJSDate(accountRecord.createdAt),
        updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
      });
    });

    test.each([
      {
        findAccountMock: () => {
          throw new Error('Error while connecting to database');
        },
        expectedResult: AccountRecoveryError,
      },
      {
        findAccountMock: () => {
          throw new Prisma.NotFoundError(
            'Could not find any register on the database',
          );
        },
        expectedResult: AccountNotFoundError,
      },
    ])(
      'findOne() throwing errors',
      async ({ findAccountMock, expectedResult }) => {
        prismaMock.account.findUniqueOrThrow.mockImplementationOnce(
          findAccountMock,
        );

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

  describe('#AccountServce.alterBalance.SuiteTests', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test.each([
      {
        accountId: accountRecord.id,
        amount: 10,
        finalBalance: Number(accountRecord.balance) + 10,
        operation: OperationType.credit,
        expectedResult: {
          ...accountRecord,
          balance: 510,
          dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
          type: accountRecord.type as AccountType,
          createdAt: DateTime.fromJSDate(accountRecord.createdAt),
          updatedAt: DateTime.now(),
        },
      },
      {
        accountId: accountRecord.id,
        amount: 10,
        finalBalance: Number(accountRecord.balance) - 10,
        operation: OperationType.debit,
        expectedResult: {
          ...accountRecord,
          balance: 490,
          dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
          type: accountRecord.type as AccountType,
          createdAt: DateTime.fromJSDate(accountRecord.createdAt),
          updatedAt: DateTime.now(),
        },
      },
    ])(
      'Should update the account balance successfully according to the given operation type',
      async ({
        accountId,
        amount,
        finalBalance,
        operation,
        expectedResult,
      }) => {
        const findOneSpy = jest
          .spyOn(AccountService.prototype, 'findOne')
          .mockResolvedValue({
            ...accountRecord,
            balance: Number(accountRecord.balance),
            dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
            type: accountRecord.type as AccountType,
            createdAt: DateTime.fromJSDate(accountRecord.createdAt),
            updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
          });

        const createNewOperationSpy = jest
          .spyOn(AccountOperationService.prototype, 'createNew')
          .mockResolvedValue({
            ...operationRecord,
            amount: Number(operationRecord.amount),
            type: operationRecord.type as OperationType,
            createdAt: DateTime.fromJSDate(operationRecord.createdAt),
            updatedAt: DateTime.fromJSDate(operationRecord.updatedAt),
          });

        prismaMock.account.update.calledWith({
          where: {
            id: accountId,
          },
          data: {
            balance: finalBalance,
            updatedAt: DateUtils.saoPauloNow().toJSDate(),
          },
        });

        prismaMock.account.update.mockResolvedValueOnce({
          ...accountRecord,
          balance: new Prisma.Decimal(finalBalance),
          updatedAt: expectedResult.updatedAt.toJSDate(),
        });

        const accountService = new AccountService();

        const result = await accountService.alterBalance(
          accountId,
          amount,
          operation,
        );

        expect(findOneSpy).toHaveBeenCalledTimes(1);
        expect(findOneSpy).toHaveBeenCalledWith(accountId);

        expect(createNewOperationSpy).toHaveBeenCalledTimes(1);
        expect(createNewOperationSpy).toHaveBeenCalledWith(
          accountId,
          amount,
          operation,
        );

        expect(result).toStrictEqual(expectedResult);
      },
    );

    test.each([
      {
        accountId: accountRecord.id,
        amount: 501,
        finalBalance: Number(accountRecord.balance) + 501,
        operation: OperationType.debit,
        updateMock: undefined,
        expectedResult: InsuficientAccountBalanceError,
      },
      {
        accountId: accountRecord.id,
        amount: 10,
        finalBalance: Number(accountRecord.balance) - 10,
        operation: OperationType.debit,
        updateMock: () => {
          throw new Error('Error while updating resource');
        },
        expectedResult: AccountBalanceAlterationError,
      },
    ])(
      'alterBalance() throwing errors',
      async ({
        accountId,
        amount,
        finalBalance,
        operation,
        updateMock,
        expectedResult,
      }) => {
        const findOneSpy = jest
          .spyOn(AccountService.prototype, 'findOne')
          .mockResolvedValue({
            ...accountRecord,
            balance: Number(accountRecord.balance),
            dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
            type: accountRecord.type as AccountType,
            createdAt: DateTime.fromJSDate(accountRecord.createdAt),
            updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
          });

        prismaMock.account.update.calledWith({
          where: {
            id: accountId,
          },
          data: {
            balance: finalBalance,
            updatedAt: DateUtils.saoPauloNow().toJSDate(),
          },
        });

        if (updateMock) {
          prismaMock.account.update.mockImplementation(updateMock);
        }

        const accountService = new AccountService();

        try {
          await accountService.alterBalance(accountId, amount, operation);
          throw new Error('Test Faild. Should not reach here!');
        } catch (error) {
          expect(findOneSpy).toHaveBeenCalledTimes(1);
          expect(findOneSpy).toHaveBeenCalledWith(accountId);

          expect(error).toStrictEqual(expectedResult);
        }
      },
    );
  });

  describe('#AccountServce.deactivate.SuiteTests', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('Should block an account successully', async () => {
      prismaMock.account.update.calledWith({
        where: {
          id: accountRecord.id,
        },
        data: {
          isActive: false,
        },
      });

      prismaMock.account.update.mockResolvedValueOnce({
        ...accountRecord,
        isActive: false,
      });

      const accountService = new AccountService();

      expect(
        accountService.deactivate(accountRecord.id),
      ).resolves.toStrictEqual({
        id: 1,
        balance: Number(accountRecord.balance),
        dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
        isActive: false,
        type: accountRecord.type,
        createdAt: DateTime.fromJSDate(accountRecord.createdAt),
        updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
      });
    });

    it('Should throw an error while trying to block account', async () => {
      prismaMock.account.update.calledWith({
        where: {
          id: accountRecord.id,
        },
        data: {
          isActive: false,
        },
      });

      prismaMock.account.update.mockImplementationOnce(() => {
        throw new Error('Error while trying to update account');
      });

      const accountService = new AccountService();

      try {
        await accountService.deactivate(accountRecord.id);
      } catch (error) {
        expect(error).toStrictEqual(AccountDeactivationError);
      }
    });
  });

  describe('#AccountServce.isBlocked.SuiteTests', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test.each([
      {
        accountId: accountRecord.id,
        isActive: true,
        expectedResult: false,
      },
      {
        accountId: accountRecord.id,
        isActive: false,
        expectedResult: true,
      },
    ])(
      'Should indicate whether an account is blocked or not',
      async ({ accountId, isActive, expectedResult }) => {
        const findOneSpy = jest
          .spyOn(AccountService.prototype, 'findOne')
          .mockResolvedValue({
            id: accountRecord.id,
            balance: Number(accountRecord.balance),
            dailyWithdrawalLimit: Number(accountRecord.dailyWithdrawalLimit),
            type: accountRecord.type as AccountType,
            createdAt: DateTime.fromJSDate(accountRecord.createdAt),
            updatedAt: DateTime.fromJSDate(accountRecord.updatedAt),
            isActive,
          });

        const accountService = new AccountService();

        const result = await accountService.isBlocked(accountId);

        expect(findOneSpy).toHaveBeenCalledTimes(1);
        expect(findOneSpy).toHaveBeenCalledWith(accountId);

        expect(result).toStrictEqual(expectedResult);
      },
    );
  });
});

describe('#AccountServiceOperation.SuiteTests', () => {
  describe('#AccountServiceOperation.createNew.SuiteTests', () => {
    it('Should create a new account operation record successfully in the database', async () => {
      prismaMock.operation.create.calledWith({
        data: {
          accountId: accountRecord.id,
          amount: operationRecord.amount,
          type: operationRecord.type,
        },
      });

      prismaMock.operation.create.mockResolvedValue(operationRecord);

      const accountOperationService = new AccountOperationService();

      expect(
        accountOperationService.createNew(
          accountRecord.id,
          Number(operationRecord.amount),
          operationRecord.type as OperationType,
        ),
      ).resolves.toStrictEqual({
        id: 1,
        accountId: 1,
        amount: 50,
        type: OperationType.debit,
        createdAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
        updatedAt: DateTime.fromJSDate(new Date(2022, 9, 1)),
      });
    });

    test.each([
      {
        createAccountOperationMock: () => {
          throw new Error('Could not create the register on the database');
        },
        mockedAccountOperationData: {
          accountId: accountRecord.id,
          amount: Number(operationRecord.amount),
          type: operationRecord.type,
        },
        expectedResult: AccountOperationCreationError,
      },
    ])(
      'AccountService.createNew() throwing errors',
      async ({
        createAccountOperationMock,
        mockedAccountOperationData,
        expectedResult,
      }) => {
        if (createAccountOperationMock) {
          prismaMock.operation.create.mockImplementationOnce(createAccountOperationMock);
        } else {
          prismaMock.operation.create.mockResolvedValue(operationRecord);
        }
        const accountOperationService = new AccountOperationService();

        try {
          await accountOperationService.createNew(
            mockedAccountOperationData.accountId,
            mockedAccountOperationData.amount,
            mockedAccountOperationData.type as OperationType,
          );
          throw new Error('Test faild! Should not reach here');
        } catch (error) {
          expect(error).toStrictEqual(expectedResult);
        }
      },
    );
  });
});
