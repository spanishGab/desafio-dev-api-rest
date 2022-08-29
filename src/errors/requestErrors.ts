import { StatusCodes } from "http-status-codes";
import { IErrorDetails, ICustomError } from "../interfaces/customError";
import requestContextManager from "../middlewares/RequestContextManager";

export class RequestError extends Error implements ICustomError {
  public readonly id: string = requestContextManager.getRequestId();
  public readonly code: string = String(StatusCodes.BAD_REQUEST);
  public readonly description: string;
  public readonly details: IErrorDetails[];
  public readonly httpStatusCode: number = StatusCodes.BAD_REQUEST;

  constructor(description: string, details: IErrorDetails[]) {
    super();
    this.description = description;
    this.details = details;
  }

  public toJSON(): ICustomError {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
      details: this.details,
    }
  }
}
