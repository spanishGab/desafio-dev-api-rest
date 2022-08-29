export interface IErrorDetails {
  attribute: string;
  message: string;
}

export interface ICustomError {
  id: string;
  code: string;
  description: string;
  details?: IErrorDetails[];
}
