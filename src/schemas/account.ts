import Joi from 'joi';
import { DateTime } from 'luxon';
import { INVALID_BIRTH_DATE, INVALID_DOCUMENT_NUMBER, INVALID_NAME } from './errorMessages';

export const dateField = Joi.string().isoDate();

export const accountCreationSchema = Joi.object({
  name: Joi.string().required().min(5).max(100).messages({ '*': INVALID_NAME }),
  documentNumber: Joi.string()
    .required()
    .length(11)
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
  birthDate: dateField
    .required()
    .custom((value, helpers) => {
      const birthDate = DateTime.fromISO(value);

      if (Math.abs(birthDate.diffNow('years').years) < 18) {
        return helpers.error('Invalid date');
      }

      return value;
    })
    .messages({ '*': INVALID_BIRTH_DATE }),
});
