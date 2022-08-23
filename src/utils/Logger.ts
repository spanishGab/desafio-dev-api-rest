import * as winston from 'winston';
import props from '../common/props';
import { REQUEST_ID } from '../middlewares/RequestContextManager';

interface ILogTrace {
  timestamp: string;
  servicename: string;
  requestId: string;
  message: { event: string; details: string; error?: any };
}

class Logger {
  private logger: winston.Logger;

  constructor() {
    const formatOptions: winston.Logform.Format = this.defineFormatOptions();

    this.logger = winston.createLogger({
      format: formatOptions,
      transports: [new winston.transports.Console()],
    });
  }

  private defineFormatOptions(): winston.Logform.Format {
    const { combine, timestamp, printf } = winston.format;

    return combine(
      timestamp(),
      winston.format.json(),
      printf(Logger.getLogStatement),
    );
  }

  private static getLogStatement(
    info: winston.Logform.TransformableInfo,
  ): string {
    const { message, level, timestamp } = info;

    const severityLevel = String(level).toLocaleUpperCase();

    const trace: ILogTrace = {
      message,
      timestamp,
      servicename: props.SERVICE_NAME,
      requestId: REQUEST_ID || 'NOT_PROVIDED',
    };

    return `[${severityLevel}]:[${trace.requestId}][${
      trace.message.event
    }] ${JSON.stringify({
      timestamp,
      serviceName: trace.servicename,
      details: message.details,
      error: message.error,
    })}`;
  }

  public info(moduleName: string, methodName: string, details: string | any) {
    this.logger.info({
      event: `${moduleName}.${methodName}`,
      details,
    });
  }

  public warn(moduleName: string, methodName: string, details: string | any) {
    this.logger.warn({
      event: `${moduleName}.${methodName}`,
      details,
    });
  }

  public error(
    moduleName: string,
    methodName: string,
    details: string | any,
    error?: any,
  ) {
    this.logger.error({
      event: `${moduleName}.${methodName}`,
      details,
      error,
    });
  }
}

export default new Logger();
