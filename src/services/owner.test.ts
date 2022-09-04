import { DateTime } from 'luxon';
import { prismaMock } from '../../prismaSingleton';
import {
  OwnerCreationError,
} from '../errors/businessError';
import { OwnerService } from './owner';

describe('#OwnerService.createNew.SuitTests', () => {
  const ownerRecord = {
    id: 1,
    name: 'Vasily Korpof',
    documentNumber: '12345678910',
    birthDate: '1988-09-01',
  };

  it('Should create a new account record successfully in the database', async () => {
    prismaMock.owner.create.mockResolvedValue(ownerRecord);

    const ownerService = new OwnerService();

    expect(
      ownerService.createNew({
        name: ownerRecord.name,
        documentNumber: ownerRecord.documentNumber,
        birthDate: ownerRecord.birthDate,
      }),
    ).resolves.toEqual({
      ...ownerRecord,
      birthDate: DateTime.fromISO(ownerRecord.birthDate),
    });
  });

  test.each([
    {
      createOwnerMock: () => {
        throw new Error('Could not create the register on the database');
      },
      expectedResult: OwnerCreationError,
    },
  ])(
    'OwnerService.createNew() throwing errors',
    async ({ createOwnerMock, expectedResult }) => {
      prismaMock.account.create.mockImplementationOnce(createOwnerMock);

      const ownerService = new OwnerService();

      try {
        await ownerService.createNew({
          name: ownerRecord.name,
          documentNumber: ownerRecord.documentNumber,
          birthDate: ownerRecord.birthDate,
        });
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});
