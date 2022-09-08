import { prismaMock } from '../../prismaSingleton';
import { OwnerCreationError, OwnerNotFoundError } from '../errors/businessError';
import { OwnerService } from './owner';

const ownerRecord = {
  id: 1,
  name: 'Vasily Korpof',
  documentNumber: '12345678910',
  birthDate: '1988-09-01',
};

const defaultOwnerSelect = {
  id: true,
  name: true,
  documentNumber: true,
  birthDate: true,
};

describe('#OwnerService.createNew.SuitTests', () => {
  it('Should create a new owner record successfully in the database', async () => {
    prismaMock.owner.findFirst.calledWith({
      where: {
        documentNumber: ownerRecord.documentNumber,
      },
      select: defaultOwnerSelect,
    });

    prismaMock.owner.findFirst.mockResolvedValue(null);

    prismaMock.owner.create.mockResolvedValue(ownerRecord);

    prismaMock.owner.create.calledWith({
      data: ownerRecord,
      select: defaultOwnerSelect,
    });

    prismaMock.owner.create.mockResolvedValue(ownerRecord);

    const ownerService = new OwnerService();

    expect(
      ownerService.createNew({
        name: ownerRecord.name,
        documentNumber: ownerRecord.documentNumber,
        birthDate: ownerRecord.birthDate,
      }),
    ).resolves.toStrictEqual(ownerRecord);
  });

  test.each([
    {
      findFirstMock: ownerRecord,
      createOwnerMock: undefined,
      expectedResult: OwnerCreationError,
    },
    {
      findFirstMock: null,
      createOwnerMock: () => {
        throw new Error('Could not create the register on the database');
      },
      expectedResult: OwnerCreationError,
    },
  ])(
    'OwnerService.createNew() throwing errors',
    async ({ findFirstMock, createOwnerMock, expectedResult }) => {
      prismaMock.owner.findFirst.mockResolvedValue(findFirstMock);

      if (createOwnerMock) {
        prismaMock.owner.create.mockImplementationOnce(createOwnerMock);
      } else {
        prismaMock.owner.create.mockResolvedValue(ownerRecord);
      }

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

describe('#OwnerService.findOne.SuitTests', () => {
  it('Should find an owner record successfully in the database', async () => {
    prismaMock.owner.findUniqueOrThrow.calledWith({
      where: {
        documentNumber: ownerRecord.documentNumber,
      },
      select: defaultOwnerSelect,
    });

    prismaMock.owner.findUniqueOrThrow.mockResolvedValue(ownerRecord);

    const ownerService = new OwnerService();

    expect(ownerService.findOne(ownerRecord.documentNumber)).resolves.toStrictEqual(
      ownerRecord,
    );
  });

  test.each([
    {
      findOwnerMock: () => {
        throw new Error('Could not find any register on the database');
      },
      expectedResult: OwnerNotFoundError,
    },
  ])(
    'findOne() throwing errors',
    async ({ findOwnerMock, expectedResult }) => {
      prismaMock.owner.findUniqueOrThrow.mockImplementationOnce(findOwnerMock);

      const ownerService = new OwnerService();

      try {
        await ownerService.findOne(ownerRecord.documentNumber);
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});
