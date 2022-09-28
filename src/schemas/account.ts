import Joi from 'joi';
import { AccountType } from '../services/account';
import {
  INVALID_DAILY_WITHDRAWAL_LIMIT,
  INVALID_ACCOUNT_TYPE,
  INVALID_BALANCE,
  INVALID_OWNERS_DOCUMENT_NUMBERS,
} from './errorMessages';
import { cpfField } from './fields';

export const accountCreationSchema = Joi.object({
  accountInformation: Joi.object({
    type: Joi.string()
      .required()
      .valid(
        AccountType.corrente,
        AccountType.poupanca,
        AccountType.salario,
        AccountType.conjunta,
      )
      .messages({ '*': INVALID_ACCOUNT_TYPE }),
    balance: Joi.number()
      .required()
      .min(0)
      .messages({ '*': INVALID_BALANCE }),
    dailyWithdrawalLimit: Joi.number()
      .required()
      .positive()
      .messages({ '*': INVALID_DAILY_WITHDRAWAL_LIMIT }),
  }),
  ownersDocumentNumbers: Joi.array()
    .items(cpfField.required())
    .required()
    .messages({
      'cpf.base': INVALID_OWNERS_DOCUMENT_NUMBERS.ITEM,
      '*': INVALID_OWNERS_DOCUMENT_NUMBERS.ARRAY,
    }),
});

export const accountRecoverySchema = Joi.object({
  id: Joi.number()
    .required()
    .positive(),
});
