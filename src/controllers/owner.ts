import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import props from '../common/props';
import { ISuccessResponseBody } from '../interfaces/response';
import RequestContextManager from '../middlewares/RequestContextManager';
import { ownerCreationSchema } from '../schemas/owner';
import { OwnerService } from '../services/owner';
import logger from '../utils/Logger';
import { Validator } from '../validators/validator';

export interface IOwnerRequestBody {
  name: string;
  documentNumber: string;
  birthDate: string;
}

export class OwnerController {
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
      .header({ Location: `/${props.VERSION}/account-owner/${id}`})
      .json({
        uuid: RequestContextManager.getRequestId(),
        message: 'Created Owner!',
      });
  }
}
