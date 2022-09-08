import request from 'supertest';

import app from '../app';
import props from '../common/props';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NewOwner, OwnerService } from '../services/owner';
import { OwnerCreationError, OwnerNotFoundError } from '../errors/businessError';
import CPF from '../utils/CPF';
import { IOwnerRequestBody } from './owner';

describe('#OwnerController.createAccountOwner.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const newOwner: IOwnerRequestBody = {
    name: 'Vasily Korpof',
    documentNumber: '36226370050',
    birthDate: '1988-09-01',
  };

  it('Should create a new account owner successfully', async () => {
    const createNewSpy = jest
      .spyOn(OwnerService.prototype, 'createNew')
      .mockImplementation(async (owner: NewOwner) => {
        return {
          id: 1,
          ...owner,
        };
      });

    const response = await request(app)
      .post(`/${props.VERSION}/account-owner`)
      .send(newOwner)
      .expect(StatusCodes.CREATED);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(newOwner);

    expect(response.body.message).toBe('Created Owner!');
    expect(response.header).toHaveProperty('location');
  });

  it('Should throw an error while trying to create a new account owner', async () => {
    const createNewSpy = jest
      .spyOn(OwnerService.prototype, 'createNew')
      .mockImplementation(async (owner: NewOwner) => {
        throw OwnerCreationError;
      });

    const response = await request(app)
      .post(`/${props.VERSION}/account-owner`)
      .send(newOwner)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(createNewSpy).toHaveBeenCalledWith(newOwner);

    expect(response.body.code).toBe(OwnerCreationError.code);
    expect(response.body.description).toBe(OwnerCreationError.description);
  });
});

describe('#OwnerController.getAccountOwner.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const owner = {
    id: 1,
    name: 'Vasily Korpof',
    documentNumber: '36226370050',
    birthDate: '1988-09-01',
  };

  it('Should find one account owner successfully', async () => {
    const findOneSpy = jest
      .spyOn(OwnerService.prototype, 'findOne')
      .mockImplementation(async (documentNumber: string) => {
        return owner;
      });

    const response = await request(app)
      .get(`/${props.VERSION}/account-owner`)
      .query({ documentNumber: owner.documentNumber })
      .expect(StatusCodes.OK);

    expect(findOneSpy).toHaveBeenCalledTimes(1);
    expect(findOneSpy).toHaveBeenCalledWith(owner.documentNumber);

    expect(response.body.message).toBe(ReasonPhrases.OK);
    expect(response.body.content).toStrictEqual({ accountOwner: owner });
  });

  it('Should throw an error while trying to recover an account owner', async () => {
    const findOneSpy = jest
      .spyOn(OwnerService.prototype, 'findOne')
      .mockImplementation(async () => {
        throw OwnerNotFoundError;
      });

    const response = await request(app)
      .get(`/${props.VERSION}/account-owner`)
      .query({ documentNumber: owner.documentNumber })
      .expect(StatusCodes.NOT_FOUND);

    expect(findOneSpy).toHaveBeenCalledTimes(1);

    expect(response.body.code).toBe(OwnerNotFoundError.code);
    expect(response.body.description).toBe(OwnerNotFoundError.description);
  });
});
