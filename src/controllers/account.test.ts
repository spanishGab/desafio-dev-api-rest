import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import request from 'supertest';
import app from '../app';
import props from '../common/props';
import { AccountCreationError } from '../errors/businessError';
import {
  AccountOperationService,
  AccountService,
  AccountType,
  IAccount,
  NewAccount,
  OperationType,
} from '../services/account';
import { OwnerService } from '../services/owner';
import { DateUtils } from '../utils/date';
import { IAccountRequestBody } from './account';

const account = {
  id: 1,
  balance: 150,
  isActive: true,
  type: 'corrente',
  createdAt: DateTime.fromISO('2022-09-07T21:33:07.969-03:00'),
  updatedAt: DateTime.fromISO('2022-09-07T21:33:07.969-03:00'),
} as IAccount;

const newAccount: IAccountRequestBody = {
  accountInformation: {
    type: AccountType.corrente,
    balance: 150,
  },
  ownersDocumentNumbers: ['83065825007'],
};

describe('#AccountController.create.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should create a new account successfully', async () => {
    const createNewSpy = jest
      .spyOn(AccountService.prototype, 'createNew')
      .mockImplementationOnce(
        async (account: NewAccount, ownersDocumentNumbers: string[]) => {
          return {
            id: 1,
            ownerId: 1,
            balance: newAccount.accountInformation.balance,
            isActive: true,
            type: newAccount.accountInformation.type,
            createdAt: DateUtils.saoPauloNow(),
            updatedAt: DateUtils.saoPauloNow(),
          };
        },
      );

    const response = await request(app)
      .post(`/${props.VERSION}/`)
      .send(newAccount)
      .expect(StatusCodes.CREATED);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(
      {
        balance: newAccount.accountInformation.balance,
        type: newAccount.accountInformation.type,
        isActive: true,
      },
      newAccount.ownersDocumentNumbers,
    );

    expect(response.body.message).toBe('Created Account!');
    expect(response.header).toHaveProperty('location');
  });

  it('Should throw an error while trying to create an account', async () => {
    const createNewSpy = jest
      .spyOn(AccountService.prototype, 'createNew')
      .mockImplementationOnce(
        async (account: NewAccount, ownersDocumentNumbers: string[]) => {
          throw AccountCreationError;
        },
      );

    const response = await request(app)
      .post(`/${props.VERSION}/`)
      .send(newAccount)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(
      {
        balance: newAccount.accountInformation.balance,
        type: newAccount.accountInformation.type,
        isActive: true,
      },
      newAccount.ownersDocumentNumbers,
    );

    expect(response.body.code).toBe(AccountCreationError.code);
    expect(response.body.description).toBe(AccountCreationError.description);
  });
});

describe('#AccountController.recover.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Should recover an account's information successfully", async () => {
    const findOneSpy = jest
      .spyOn(AccountService.prototype, 'findOne')
      .mockImplementation(async (id: number) => {
        return account;
      });

    // Mocking AuthGateway
    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .get(
        `/${props.VERSION}/${account.id}?documentNumber=${ownerDocumentNumber}`,
      )
      .expect(StatusCodes.OK);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(account.id);

    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith(account.id);

    expect(response.body.message).toBe(ReasonPhrases.OK);
    expect(response.body.content).toStrictEqual({
      ...account,
      createdAt: account.createdAt.toString(),
      updatedAt: account.updatedAt.toString(),
    });
  });
});

describe('#AccountController.deposit.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should deposit money on an account', async () => {
    const alterBalanceSpy = jest
      .spyOn(AccountService.prototype, 'alterBalance')
      .mockResolvedValueOnce({
        ...account,
        balance: account.balance + 10,
        updatedAt: DateTime.now(),
      });

    // Mocking AuthGateway
    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .put(
        `/${props.VERSION}/deposit/${account.id}?documentNumber=${ownerDocumentNumber}`,
      )
      .send({ amount: 10 })
      .expect(StatusCodes.OK);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(account.id);

    expect(alterBalanceSpy).toHaveBeenCalledTimes(1);
    expect(alterBalanceSpy).toHaveBeenCalledWith(account.id, 10, 'deposit');

    expect(response.body.message).toBe(ReasonPhrases.OK);
  });
});

describe('#AccountController.withdrawal.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should withdrawal money from an account', async () => {
    const alterBalanceSpy = jest
      .spyOn(AccountService.prototype, 'alterBalance')
      .mockResolvedValueOnce({
        ...account,
        balance: account.balance - 10,
        updatedAt: DateTime.now(),
      });

    // Mocking AuthGateway
    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .put(
        `/${props.VERSION}/withdrawal/${account.id}?documentNumber=${ownerDocumentNumber}`,
      )
      .send({ amount: 10 })
      .expect(StatusCodes.OK);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(account.id);

    expect(alterBalanceSpy).toHaveBeenCalledTimes(1);
    expect(alterBalanceSpy).toHaveBeenCalledWith(account.id, 10, 'withdrawal');

    expect(response.body.message).toBe(ReasonPhrases.OK);
  });
});

describe('#AccountController.block.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should block an account', async () => {
    const blockSpy = jest
      .spyOn(AccountService.prototype, 'deactivate')
      .mockResolvedValueOnce({
        ...account,
        isActive: false,
      });

    // Mocking AuthGateway
    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .put(
        `/${props.VERSION}/block/${account.id}?documentNumber=${ownerDocumentNumber}`,
      )
      .expect(StatusCodes.OK);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(account.id);

    expect(blockSpy).toHaveBeenCalledTimes(1);
    expect(blockSpy).toHaveBeenCalledWith(account.id);

    expect(response.body.message).toBe(ReasonPhrases.OK);
  });
});

describe('#AccountController.paginatedlyFindMany.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should return account operations as paginated results', async () => {
    const paginatedlyFindManySpy = jest
      .spyOn(AccountOperationService.prototype, 'paginatedlyFindMany')
      .mockResolvedValueOnce({
        totalPages: 3,
        operations: [
          {
            id: 3,
            accountId: 1,
            amount: 1000,
            type: OperationType.credit,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          },
          {
            id: 4,
            accountId: 1,
            amount: 1000,
            type: OperationType.credit,
            createdAt: DateTime.now().minus({ days: 1 }),
            updatedAt: DateTime.now().minus({ days: 1 }),
          },
        ],
      });

    // Mocking AuthGateway
    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const isAccountBlockedSpy = jest
      .spyOn(AccountService.prototype, 'isBlocked')
      .mockResolvedValue(false);

    const ownerDocumentNumber = '19777965087';
    const body = {
      period: 5,
      page: 2,
      itemsPerPage: 2,
    };

    const response = await request(app)
      .get(
        `/${props.VERSION}/statement/${account.id}?documentNumber=${ownerDocumentNumber}&period=${body.period}&page=${body.page}&itemsPerPage=${body.itemsPerPage}`,
      )
      .send(body)
      .expect(StatusCodes.OK);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

    expect(isAccountBlockedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountBlockedSpy).toHaveBeenCalledWith(account.id);

    expect(paginatedlyFindManySpy).toHaveBeenCalledTimes(1);
    expect(paginatedlyFindManySpy).toHaveBeenCalledWith(
      account.id,
      body.period,
      body.page,
      body.itemsPerPage,
    );

    expect(response.body.message).toBe(ReasonPhrases.OK);
    expect(response.body.content).toHaveProperty('totalPages');
    expect(response.body.content).toHaveProperty('operations');
    expect(response.body.content.operations).toHaveLength(2);
  });
});
