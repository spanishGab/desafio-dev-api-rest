import Joi from 'joi';
import { AccountType } from '../services/account';
import {
  INVALID_DAILY_WITHDRAWAL_LIMIT,
  INVALID_ACCOUNT_TYPE,
  INVALID_BALANCE,
  INVALID_OWNERS_DOCUMENT_NUMBERS,
  INVALID_ACCOUNT_ID,
  INVALID_OPERATION_AMOUNT,
  INVALID_PERIOD,
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
    .positive()
    .integer()
    .messages({ '*': INVALID_ACCOUNT_ID }),
});

export const accountOperationSchema = Joi.object({
  amount: Joi.number()
    .required()
    .positive()
    .messages({ '*': INVALID_OPERATION_AMOUNT }),
});

export const transactionStatementSchema = Joi.object({
  period: Joi.number()
    .required()
    .positive()
    .integer()
    .messages({ '*': INVALID_PERIOD })
})
