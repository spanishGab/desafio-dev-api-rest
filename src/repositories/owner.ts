import { Owner, Prisma, PrismaClient } from '@prisma/client';
import dbClient from '../db';
import IRepositoryAdapter from './IRepositoryAdapter';

class OwnerRepository // TODO: finish implementation
  implements
    IRepositoryAdapter<
      Owner,
      Prisma.OwnerSelect,
      Prisma.OwnerWhereUniqueInput
    >
{
  public client: PrismaClient = dbClient;

  public async create(
    data: Owner,
  ): Promise<Owner> {
    const createdOwner: Owner = await dbClient.owner.create({
      select: {
        id: true,
        name: true,
        documentNumber: true,
        birthDate: true,
      },
      data,
    });

    return createdOwner;
  }
}
