import * as winston from 'winston';
import props from '../common/props';
import requestContextManager from '../middlewares/RequestContextManager';

interface InfoElements {
  event: string;
  details: any;
}

interface ILogTrace {
  timestamp: string;
  servicename: string;
  requestId: string;
  message: InfoElements;
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
      requestId: requestContextManager.getRequestId() || 'NOT_PROVIDED',
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

  public info(elements: InfoElements) {
    this.logger.info(elements);
  }

  public warn(elements: InfoElements) {
    this.logger.warn(elements);
  }

  public error(elements: InfoElements) {
    this.logger.error(elements);
  }
}

export default new Logger();
