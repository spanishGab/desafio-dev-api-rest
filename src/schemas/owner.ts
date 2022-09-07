import Joi from 'joi';
import { DateTime } from 'luxon';
import { dateField } from './fields';
import {
  INVALID_BIRTH_DATE,
  INVALID_DOCUMENT_NUMBER,
  INVALID_OWNER_NAME,
} from './errorMessages';
import { cpfField } from './fields';
import { DateUtils } from '../utils/date';

export const ownerRecoverySchema = Joi.object({
  documentNumber: cpfField
    .required()
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
});

export const ownerCreationSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(5)
    .max(100)
    .regex(
      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð .'-]+$/u,
    )
    .messages({ '*': INVALID_OWNER_NAME }),
  documentNumber: cpfField
    .required()
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
  birthDate: dateField
    .required()
    .custom((date, helpers) => {
      if (DateUtils.saoPauloNow().diff(DateTime.fromISO(date), 'years').years < 18) {
        return helpers.error('birthDate.base');
      }

      return date;
    })
    .messages({ '*': INVALID_BIRTH_DATE }),
});
