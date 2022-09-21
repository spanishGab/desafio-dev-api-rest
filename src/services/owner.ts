import { Owner } from '@prisma/client';
import { DateTime } from 'luxon';

import dbClient from '../db';
import {
  OwnerAlreadyExistsError,
  OwnerCreationError,
  OwnerNotFoundError,
} from '../errors/businessError';
import CPF from '../utils/CPF';
import { SHORT_ISO8601 } from '../utils/date';
import logger from '../utils/Logger';

export type NewOwner = Omit<Owner, 'id'>;

const defaultOwnerSelect = {
  id: true,
  name: true,
  documentNumber: true,
  birthDate: true,
};

export class OwnerService {
  public async createNew(owner: NewOwner): Promise<Owner> {
    logger.info({ event: 'OwnerService.createNew', details: { owner } });

    try {
      const existingOwner = await dbClient.owner.findFirst({
        where: {
          documentNumber: owner.documentNumber,
        },
        select: defaultOwnerSelect,
      });

      if (existingOwner) {
        logger.warn({
          event: 'OwnerService.createNew.ownerAlreadyExists',
          details: { existingOwner },
        });
        throw OwnerAlreadyExistsError;
      }

      const createdOwner: Owner = await dbClient.owner.create({
        data: owner,
        select: defaultOwnerSelect,
      });

      return this.fromDBRecord(createdOwner);
    } catch (error) {
      logger.error({
        event: 'OwnerService.createNew.error',
        details: {
          error: error.message || error,
        },
      });

      if (error.code === OwnerAlreadyExistsError.code) {
        throw error;
      }

      throw OwnerCreationError;
    }
  }

  public async findOne(documentNumber: string): Promise<Owner> {
    logger.info({
      event: 'OwnerService.findOne',
      details: { documentNumber },
    });

    try {
      const owner: Owner = await dbClient.owner.findUniqueOrThrow({
        where: {
          documentNumber: documentNumber,
        },
        select: defaultOwnerSelect,
      });

      return this.fromDBRecord(owner);
    } catch (error) {
      logger.error({
        event: 'OwnerService.findOne.error',
        details: {
          error: error.message,
        },
      });

      throw OwnerNotFoundError;
    }
  }

  private fromDBRecord(owner: Owner): Owner {
    return {
      ...owner,
      birthDate: DateTime.fromISO(owner.birthDate).toFormat(SHORT_ISO8601),
    };
  }
}
