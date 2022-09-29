import { AccountOwner, Owner, Prisma } from '@prisma/client';
import { prismaMock } from '../../prismaSingleton';
import {
  OwnerCreationError,
  OwnerNotFoundError,
} from '../errors/businessError';
import { OwnerServiceError } from '../errors/internalErrors';
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

const accountOwnerRecord = {
  accountId: 1,
  ownerId: ownerRecord.id,
} as AccountOwner;

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

    expect(
      ownerService.findOne(ownerRecord.documentNumber),
    ).resolves.toStrictEqual(ownerRecord);
  });

  test.each([
    {
      findOwnerMock: () => {
        throw new Error('Could not find any register on the database');
      },
      expectedResult: OwnerNotFoundError,
    },
  ])('findOne() throwing errors', async ({ findOwnerMock, expectedResult }) => {
    prismaMock.owner.findUniqueOrThrow.mockImplementationOnce(findOwnerMock);

    const ownerService = new OwnerService();

    try {
      await ownerService.findOne(ownerRecord.documentNumber);
      throw new Error('Test faild! Should not reach here');
    } catch (error) {
      expect(error).toStrictEqual(expectedResult);
    }
  });
});

describe('#OwnerService.isAccountOwnerAuthorized.SuitTests', () => {
  it('Should return true if the given account belongs to the given owner', async () => {
    prismaMock.owner.findUniqueOrThrow.calledWith({
      where: {
        documentNumber: ownerRecord.documentNumber,
      },
      include: {
        accountOwners: true,
      },
    });

    prismaMock.owner.findUniqueOrThrow.mockResolvedValue({
      ...ownerRecord,
      accountOwners: [accountOwnerRecord],
    } as Owner & { accountOwners: AccountOwner[] });

    const ownerService = new OwnerService();

    expect(
      ownerService.isAccountOwnerAuthorized(
        ownerRecord.documentNumber,
        accountOwnerRecord.accountId,
      ),
    ).resolves.toBe(true);
  });

  test.each([
    {
      calledWith: {
        where: {
          documentNumber: ownerRecord.documentNumber,
        },
        include: {
          accountOwners: true,
        },
      },
      mockResolvedValue: {
        ...ownerRecord,
        accountOwners: [
          {
            ownerId: 1,
            accountId: 2,
          },
          {
            ownerId: 1,
            accountId: 3,
          },
        ],
      } as Owner & { accountOwners: AccountOwner[] },
    },
    {
      calledWith: {
        where: {
          documentNumber: ownerRecord.documentNumber,
        },
        include: {
          accountOwners: true,
        },
      },
      mockResolvedValue: ownerRecord,
    },
  ])(
    'isAccountOwnerAuthorized() returning false',
    ({ calledWith, mockResolvedValue }) => {
      prismaMock.owner.findUniqueOrThrow.calledWith(calledWith);

      prismaMock.owner.findUniqueOrThrow.mockResolvedValue(mockResolvedValue);

      const ownerService = new OwnerService();

      expect(
        ownerService.isAccountOwnerAuthorized(
          ownerRecord.documentNumber,
          accountOwnerRecord.accountId,
        ),
      ).resolves.toBe(false);
    },
  );

  test.each([
    {
      findUniqueOrThrowMock: () => {
        throw new Prisma.NotFoundError('Could not find any register on the database');
      },
      accountIdMock: 2,
      expectedResult: OwnerNotFoundError,
    },
    {
      findUniqueOrThrowMock: () => {
        throw new Error('Error while performing query on the database');
      },
      accountIdMock: 2,
      expectedResult: OwnerServiceError,
    },
  ])(
    'isAccountOwnerAuthorized() throwing errors',
    async ({ findUniqueOrThrowMock, accountIdMock, expectedResult }) => {
      prismaMock.owner.findUniqueOrThrow.mockImplementationOnce(
        findUniqueOrThrowMock,
      );

      const ownerService = new OwnerService();

      try {
        await ownerService.isAccountOwnerAuthorized(
          ownerRecord.documentNumber,
          accountIdMock,
        );
        throw new Error('Test faild! Should not reach here');
      } catch (error) {
        expect(error).toStrictEqual(expectedResult);
      }
    },
  );
});
