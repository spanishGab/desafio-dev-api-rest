import { Owner } from '@prisma/client';
import { DateTime } from 'luxon';

import dbClient from '../db';
import { OwnerCreationError } from '../errors/businessError';
import logger from '../utils/Logger';

export interface IOwner {
  id: number;
  name: string;
  documentNumber: string;
  birthDate: DateTime;
}

export type NewOwner = Omit<Owner, 'id'>;

export class OwnerService {
  public async createNew(owner: NewOwner): Promise<IOwner> {
    logger.info({ event: 'OwnerService.createNew', details: { owner } });

    try {
      const createdOwner: Owner = await dbClient.owner.create({
        data: owner,
        select: {
          id: true,
          name: true,
          documentNumber: true,
          birthDate: true,
        },
      });

      return this.fromDBRecord(createdOwner);
    } catch (error) {
      logger.error({
        event: 'OwnerService.createNew.error',
        details: {
          error: error.message
        },
      });

      throw OwnerCreationError;
    }
  }

  private fromDBRecord(owner: Owner): IOwner {
    return {
      ...owner,
      birthDate: DateTime.fromISO(owner.birthDate),
    };
  }
}
