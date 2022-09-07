export const INVALID_ACCOUNT_TYPE =
  "The 'type' attribute must be a string containing one of these values: corrente, poupanca, salario, conjunta";
export const INVALID_OWNER_NAME =
  "The 'name' field must be a string containing between 5 and 100 letters or symbols like ( .'-)";
export const INVALID_DOCUMENT_NUMBER =
  "The 'documentNumber' field must be a string representing a valid CPF";
export const INVALID_BIRTH_DATE =
  "The 'birthDate' field must be a string representing a valid ISO8601 date. The account owner must also be older than 18 years";
export const INVALID_BALANCE = "The 'balance' field must be a positive number";
export const INVALID_DAILY_WITHDRAWAL_LIMIT =
  "The 'dailyWithdrawalLimit' field must be a positive number";
