export interface ISuccessResponseBody {
  uuid: string;
  message: string;
}

export interface IErrorDetails {
  attribute: string;
  message: string;
}

export interface IErrorResponseBody {
  id: string;
  code: string;
  description: string;
  errorDetails?: IErrorDetails[];
}
