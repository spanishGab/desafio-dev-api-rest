import { Response, NextFunction, Request } from 'express';
import { v4 as uuidV4 } from 'uuid';

export const REQUEST_ID = uuidV4();

export class RequestContextManager {
  public static createContext(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    req.id = REQUEST_ID;
    
    next();    
  }
}
