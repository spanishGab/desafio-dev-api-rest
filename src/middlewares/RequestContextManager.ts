import cls from 'cls-hooked';
import { Response, NextFunction, Request } from 'express';
import { v4 as uuidV4 } from 'uuid';

const NAMESPACE: cls.Namespace = cls.createNamespace(uuidV4());

class RequestContextManager {
  public static createContext(
    req: Request,
    res: Response,
    next: NextFunction,
  ): boolean {
    NAMESPACE.bindEmitter(req);
    NAMESPACE.bindEmitter(res);
    
    const requestId: string = uuidV4();
    
    req.id = requestId;
    
    NAMESPACE.run(() => {
      NAMESPACE.set('requestId', requestId);
      next();
    });

    return true;
  }

  public static getRequestId(): string {
    return NAMESPACE.get('requestId');
  }
}

export default RequestContextManager;
