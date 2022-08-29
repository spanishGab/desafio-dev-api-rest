import { StatusCodes } from "http-status-codes";
import { ICustomError } from '../interfaces/customError';
import requestContextManager from "../middlewares/RequestContextManager";

export class BaseInternalError extends Error implements ICustomError {
  public readonly id: string = requestContextManager.getRequestId();
  public readonly code: string = String(StatusCodes.INTERNAL_SERVER_ERROR);
  public readonly description: string;
  public readonly httpStatusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(description: string) {
    super();
    this.description = description;
  }

  public toJSON(): ICustomError {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
    }
  }
}
