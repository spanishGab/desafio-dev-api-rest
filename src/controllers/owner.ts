import { Owner } from '@prisma/client';
import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import props from '../common/props';
import { ISuccessResponseBody } from '../interfaces/response';
import { ownerRecoverySchema, ownerCreationSchema } from '../schemas/owner';
import { OwnerService } from '../services/owner';
import CPF from '../utils/CPF';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

interface IRecoverOwnerResponse {
  accountOwner: Owner,
}

export interface IOwnerRequestBody {
  name: string;
  documentNumber: string;
  birthDate: string;
}

export class OwnerController {
  static async recoverAccountOwner(
    req: Request,
    res: Response<ISuccessResponseBody<IRecoverOwnerResponse>>,
  ): Promise<Response> {
    logger.info({
      event: 'OwnerController.recoverAccountOwner.init',
      details: { inputData: req.query },
    });

    const { documentNumber } = await Validator.validateFieldsBySchema<{
      documentNumber: string;
    }>(req.query, ownerRecoverySchema);

    const ownerService = new OwnerService();

    const owner: Owner = await ownerService.findOne(new CPF(documentNumber));

    return res.status(StatusCodes.OK).json({
      uuid: req.id,
      message: ReasonPhrases.OK,
      content: {
        accountOwner: owner,
      },
    });
  }

  static async createAccountOwner(
    req: Request,
    res: Response<ISuccessResponseBody>,
  ): Promise<Response> {
    logger.info({
      event: 'OwnerController.createAccountOwner.init',
      details: { inputData: req.body },
    });

    const inputData = await Validator.validateFieldsBySchema<IOwnerRequestBody>(
      req.body,
      ownerCreationSchema,
    );

    const ownerService = new OwnerService();

    const { id } = await ownerService.createNew(inputData);

    return res
      .status(StatusCodes.CREATED)
      .header({ location: `/${props.VERSION}/account-owner/${id}` })
      .json({
        uuid: req.id,
        message: 'Created Owner!',
      });
  }
}
