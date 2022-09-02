import Joi from 'joi';
import { DateTime } from 'luxon';
import CPF from '../utils/CPF';

export const dateField = Joi.string().custom(
  (date: string, helpers: Joi.CustomHelpers) => {
    if (!DateTime.fromISO(date).isValid) {
      return helpers.error('date.base');
    }

    return date;
  },
);

export const cpfField = Joi.string()
  .custom((documentNumber: string, helpers: Joi.CustomHelpers) => {
    const cpf = new CPF(documentNumber);

    if (!(cpf.isValid())) {
      return helpers.error('cpf.base');
    }

    return cpf.code;
  });
