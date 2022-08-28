import Joi from 'joi';
import { AccountType } from '../services/account';
import {
  INVALID_DAILY_WITHDRAWAL_LIMIT,
  INVALID_DOCUMENT_NUMBER,
  INVALID_ACCOUNT_TYPE,
} from './errorMessages';

export const dateField = Joi.string().isoDate();

export const accountCreationSchema = Joi.object({
  documentNumber: Joi.string()
    .required()
    .length(11)
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
  type: Joi.string()
    .required()
    .allow(
      AccountType.corrente,
      AccountType.poupanca,
      AccountType.salario,
      AccountType.conjunta,
    )
    .messages({ '*': INVALID_ACCOUNT_TYPE }),
  dailyWithdrawalLimit: Joi.number()
    .required()
    .positive()
    .messages({ '*': INVALID_DAILY_WITHDRAWAL_LIMIT }),
});
