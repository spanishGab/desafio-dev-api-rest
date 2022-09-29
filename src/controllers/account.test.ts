import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import request from 'supertest';
import app from '../app';
import props from '../common/props';
import {
  AccountCreationError,
  AccountNotFoundError,
} from '../errors/businessError';
import { OwnershipGateway } from '../middlewares/ownershipGateway';
import {
  AccountService,
  AccountType,
  IAccount,
  NewAccount,
} from '../services/account';
import { OwnerService } from '../services/owner';
import { DateUtils } from '../utils/date';
import { IAccountRequestBody } from './account';

const account = {
  id: 1,
  balance: 150,
  dailyWithdrawalLimit: 100,
  isActive: true,
  type: 'corrente',
  createdAt: DateTime.fromISO('2022-09-07T21:33:07.969-03:00'),
  updatedAt: DateTime.fromISO('2022-09-07T21:33:07.969-03:00'),
} as IAccount;

const newAccount: IAccountRequestBody = {
  accountInformation: {
    type: AccountType.corrente,
    balance: 150,
    dailyWithdrawalLimit: 200,
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
            dailyWithdrawalLimit:
              newAccount.accountInformation.dailyWithdrawalLimit,
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
        dailyWithdrawalLimit:
          newAccount.accountInformation.dailyWithdrawalLimit,
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
        dailyWithdrawalLimit:
          newAccount.accountInformation.dailyWithdrawalLimit,
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
      .mockImplementationOnce(async (id: number) => {
        return account;
      });

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .get(
        `/${props.VERSION}/${account.id}?documentNumber=${ownerDocumentNumber}`,
      )
      .expect(StatusCodes.OK);

    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith(account.id);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      account.id,
    );

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

  it('Should deposit money on the account', async () => {
    const alterBalanceSpy = jest
      .spyOn(AccountService.prototype, 'alterBalance')
      .mockResolvedValueOnce({
        ...account,
        balance: account.balance + 10,
        updatedAt: DateTime.now(),
      });

    const response = await request(app)
      .put(`/${props.VERSION}/deposit/${account.id}?documentNumber=19777965087`)
      .send({ amount: 10 })
      .expect(StatusCodes.OK);

    expect(alterBalanceSpy).toHaveBeenCalledTimes(1);
    expect(alterBalanceSpy).toHaveBeenCalledWith(account.id, 10, 'CR');

    expect(response.body.message).toBe(ReasonPhrases.OK);
  });
});
