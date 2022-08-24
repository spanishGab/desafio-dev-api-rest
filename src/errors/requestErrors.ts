import { StatusCodes } from "http-status-codes";
import { IErrorDetails, IErrorResponseBody } from "../interfaces/response";
import requestContextManager from "../middlewares/RequestContextManager";

export class RequestError extends Error {
  public readonly id: string = requestContextManager.getRequestId();
  public readonly code: string = String(StatusCodes.BAD_REQUEST);
  public readonly description: string;
  public readonly errorDetails: IErrorDetails[];
  public readonly httpStatusCode: number = StatusCodes.BAD_REQUEST;

  constructor(description: string, errorDetails: IErrorDetails[]) {
    super();
    this.description = description;
    this.errorDetails = errorDetails;
  }

  public toJSON(): IErrorResponseBody {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
      errorDetails: this.errorDetails,
    }
  }
}
