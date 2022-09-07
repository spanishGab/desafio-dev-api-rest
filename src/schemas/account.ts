import Joi from 'joi';
import { AccountType } from '../services/account';
import {
  INVALID_DAILY_WITHDRAWAL_LIMIT,
  INVALID_DOCUMENT_NUMBER,
  INVALID_ACCOUNT_TYPE,
  INVALID_BALANCE,
} from './errorMessages';
import { cpfField } from './fields';

export const accountCreationSchema = Joi.object({
  ownerDocumentNumber: cpfField
    .required()
    .messages({ '*': INVALID_DOCUMENT_NUMBER }),
  accountInformation: Joi.object({
    type: Joi.string()
      .required()
      .allow(
        AccountType.corrente,
        AccountType.poupanca,
        AccountType.salario,
        AccountType.conjunta,
      )// TODO FIX THIS BUG
      .messages({ '*': INVALID_ACCOUNT_TYPE }),
    balance: Joi.number()
      .required()
      .positive()
      .messages({ '*': INVALID_BALANCE }),
    dailyWithdrawalLimit: Joi.number()
      .required()
      .positive()
      .messages({ '*': INVALID_DAILY_WITHDRAWAL_LIMIT }),
  }),
});
