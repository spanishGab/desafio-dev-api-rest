import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../app';
import props from '../common/props';
import { AccountCreationError } from '../errors/businessError';
import { AccountService, AccountType, NewAccount } from '../services/account';
import CPF from '../utils/CPF';
import { DateUtils } from '../utils/date';
import { IAccountRequestBody } from './account';

describe('#AccountController.createAccount.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const newAccount: IAccountRequestBody = {
    ownerDocumentNumber: '83065825007',
    accountInformation: {
      type: AccountType.corrente,
      balance: 150,
      dailyWithdrawalLimit: 200,
    }
  };

  it('Should create a new account successfully', async () => {
    const createNewSpy = jest
      .spyOn(AccountService.prototype, 'createNew')
      .mockImplementation(async (account: NewAccount, documentNumber: CPF) => {
        return {
          id: 1,
          ownerId: 1,
          balance: newAccount.accountInformation.balance,
          dailyWithdrawalLimit: newAccount.accountInformation.dailyWithdrawalLimit,
          isActive: true,
          type: newAccount.accountInformation.type,
          createdAt: DateUtils.saoPauloNow(),
          updatedAt: DateUtils.saoPauloNow()
        }
      });

    const response = await request(app)
      .post(`/${props.VERSION}/`)
      .send(newAccount)
      .expect(StatusCodes.CREATED);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(
      {
        balance: newAccount.accountInformation.balance,
        dailyWithdrawalLimit: newAccount.accountInformation.dailyWithdrawalLimit,
        type: newAccount.accountInformation.type,
        isActive: true,
      },
      new CPF(newAccount.ownerDocumentNumber),
    );

    expect(response.body.message).toBe('Created Account!');
    expect(response.header).toHaveProperty('location');
  });

  it('Should create a new account successfully', async () => {
    const createNewSpy = jest
      .spyOn(AccountService.prototype, 'createNew')
      .mockImplementation(async (account: NewAccount, documentNumber: CPF) => {
        throw AccountCreationError;
      });

    const response = await request(app)
      .post(`/${props.VERSION}/`)
      .send(newAccount)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(
      {
        balance: newAccount.accountInformation.balance,
        dailyWithdrawalLimit: newAccount.accountInformation.dailyWithdrawalLimit,
        type: newAccount.accountInformation.type,
        isActive: true,
      },
      new CPF(newAccount.ownerDocumentNumber),
    );

    expect(response.body.code).toBe(AccountCreationError.code);
    expect(response.body.description).toBe(AccountCreationError.description);
  });
})
