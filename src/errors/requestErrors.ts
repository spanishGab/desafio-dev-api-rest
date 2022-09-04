import { StatusCodes } from "http-status-codes";
import { IErrorDetails, ICustomError } from "../interfaces/customError";

export class RequestError extends Error implements Omit<ICustomError, 'id'> {
  public readonly code: string = String(StatusCodes.BAD_REQUEST);
  public readonly description: string;
  public readonly details: IErrorDetails[];
  public readonly httpStatusCode: number = StatusCodes.BAD_REQUEST;

  constructor(description: string, details: IErrorDetails[]) {
    super();
    this.description = description;
    this.details = details;
  }

  public toJSON(): Omit<ICustomError, 'id'> {
    return {
      code: this.code,
      description: this.description,
      details: this.details,
    }
  }
}
