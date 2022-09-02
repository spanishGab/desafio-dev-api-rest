import Joi from 'joi';
import { dateField } from './account';
import {
  INVALID_BIRTH_DATE,
  INVALID_DOCUMENT_NUMBER,
  INVALID_OWNER_NAME,
} from './errorMessages';
import { cpfField } from './fields';

export const ownerCreationSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(5)
    .max(100)
    .regex(
      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
    )
    .messages({ '*': INVALID_OWNER_NAME }),
  documentNumber: cpfField
    .required()
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
  birthDate: dateField.required().messages({ '*': INVALID_BIRTH_DATE }),
});
