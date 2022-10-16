export const INVALID_ACCOUNT_TYPE =
  'Attribute must be a string equal to one of these values: corrente, poupanca, salario, conjunta';
export const INVALID_OWNER_NAME =
  "Attribute must be a string containing between 5 and 100 letters or symbols like ( .'-)";
export const INVALID_DOCUMENT_NUMBER =
  'Attribute must be a string representing a valid CPF';
export const INVALID_OWNERS_DOCUMENT_NUMBERS = {
  ITEM: "'ownersDocumentNumbers' items must be a string representing a valid CPF",
  ARRAY: 'Attribute must contain only string elements representing a valid CPF',
};
export const INVALID_BIRTH_DATE =
  'Attribute must be a string representing a valid ISO8601 date. The account owner must also be older than 18 years';
export const INVALID_PERIOD =
  'Attribute must be an integer number representing how many days from now the transaction statement must be generated';
export const INVALID_BALANCE = 'Attribute must be a positive number';
export const INVALID_DAILY_WITHDRAWAL_LIMIT =
  'Attribute must be a positive number';
export const INVALID_ACCOUNT_ID =
  'Attribute must be a positive number representing a valid account id';
export const INVALID_OPERATION_AMOUNT = 'Attribute must be a positive number';
