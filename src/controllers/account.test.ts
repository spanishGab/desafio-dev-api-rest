import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import request from 'supertest';
import app from '../app';
import props from '../common/props';
import { AccountCreationError, AccountNotFoundError } from '../errors/businessError';
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

describe('#AccountController.createAccount.SuiteTests', () => {
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

describe('#AccountController.recoverAccount.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Should recover an account's information successfully", async () => {
    const recoverAccountSpy = jest
      .spyOn(AccountService.prototype, 'findOne')
      .mockImplementationOnce(async (id: number) => {
        return account;
      });

    const response = await request(app)
      .get(`/${props.VERSION}/${account.id}?documentNumber=19777965087`)
      .expect(StatusCodes.OK)

    expect(recoverAccountSpy).toHaveBeenCalledTimes(1);
    expect(recoverAccountSpy).toHaveBeenCalledWith(account.id);

    expect(response.body.message).toBe(ReasonPhrases.OK);
    expect(response.body.content).toStrictEqual({
      ...account,
      createdAt: account.createdAt.toString(),
      updatedAt: account.updatedAt.toString()
    });
  });

  it('Should return a Not Found error when no account information is found', async () => {
    const recoverAccountSpy = jest
      .spyOn(AccountService.prototype, 'findOne')
      .mockImplementationOnce(async (id: number) => {
        throw AccountNotFoundError;
      });

    const isAccountOwnerAuthorizedSpy = jest
      .spyOn(OwnerService.prototype, 'isAccountOwnerAuthorized')
      .mockResolvedValue(true);

    const wrongAccountId = 1857400;
    const ownerDocumentNumber = '19777965087';

    const response = await request(app)
      .get(`/${props.VERSION}/${wrongAccountId}?documentNumber=${ownerDocumentNumber}`)
      .expect(StatusCodes.NOT_FOUND)

    expect(recoverAccountSpy).toHaveBeenCalledTimes(1);
    expect(recoverAccountSpy).toHaveBeenCalledWith(wrongAccountId);

    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledTimes(1);
    expect(isAccountOwnerAuthorizedSpy).toHaveBeenCalledWith(
      ownerDocumentNumber,
      String(wrongAccountId),
    );

    expect(response.body.description).toBe('Account not found');
  });
});
