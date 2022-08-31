import Joi from 'joi';
import { RequestError } from '../errors/requestErrors';
import { IErrorDetails } from '../interfaces/customError';
import logger from '../utils/Logger';

export class Validator {
  static async validateFieldsBySchema<T>(
    fields: any,
    schema: Joi.Schema,
  ): Promise<T> {
    try {
      return await schema.validateAsync(fields, {
        abortEarly: false,
      });
    } catch (validationError) {
      const error: Joi.ValidationError = validationError as Joi.ValidationError;

      logger.error({
        event: 'Validator.validateFieldsBySchema',
        details: { errorDetails: error.details },
      });

      let errorDetails: IErrorDetails[] = [];

      error.details.forEach((detail) => {
        errorDetails.push({
          attribute: detail.context?.key || 'unknown',
          message: detail.message,
        });
      });

      throw new RequestError(error.name, errorDetails);
    }
  }
}
