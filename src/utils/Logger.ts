import * as winston from 'winston';

interface ILogTrace {
  timestamp: string;
  servicename: string;
  requestId: string;
  message: string;
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
    const { message, level, timestamp, event } = info;

    const severityLevel = String(level).toLocaleUpperCase();

    const trace: ILogTrace = {
      timestamp,
      servicename: props.SERVICE_NAME,
      requestId: RequestContextManager.getRequestId(),
      message: message,
    };

    return `[${severityLevel}]:[${trace.requestId}][${event}] ${JSON.stringify(
      trace,
    )}`;
  }

  public info(moduleName: string, methodName: string, details: string | any) {
    this.logger.info({
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
