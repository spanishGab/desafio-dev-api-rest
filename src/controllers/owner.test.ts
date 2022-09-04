import request from 'supertest';

import app from '../app';
import props from '../common/props';
import { StatusCodes } from 'http-status-codes';
import { NewOwner, OwnerService } from '../services/owner';
import { DateTime } from 'luxon';
import { OwnerCreationError } from '../errors/businessError';

describe('#OwnerController.createAccountOwner.SuiteTests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  })
  const newOwner = {
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
          birthDate: DateTime.fromISO(owner.birthDate),
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
      .mockImplementation(async () => {
        throw OwnerCreationError;
      });

    const response = await request(app)
      .post(`/${props.VERSION}/account-owner`)
      .send(newOwner)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(createNewSpy).toHaveBeenCalledTimes(1);

    expect(response.body.code).toBe(OwnerCreationError.code);
    expect(response.body.description).toBe(OwnerCreationError.description);
  });
});
