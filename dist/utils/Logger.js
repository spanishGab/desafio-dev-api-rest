"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const props_1 = __importDefault(require("../common/props"));
const RequestContextManager_1 = require("../middlewares/RequestContextManager");
class Logger {
    constructor() {
        const formatOptions = this.defineFormatOptions();
        this.logger = winston.createLogger({
            format: formatOptions,
            transports: [new winston.transports.Console()],
        });
    }
    defineFormatOptions() {
        const { combine, timestamp, printf } = winston.format;
        return combine(timestamp(), winston.format.json(), printf(Logger.getLogStatement));
    }
    static getLogStatement(info) {
        const { message, level, timestamp } = info;
        const severityLevel = String(level).toLocaleUpperCase();
        const trace = {
            message,
            timestamp,
            servicename: props_1.default.SERVICE_NAME,
            requestId: RequestContextManager_1.REQUEST_ID || 'NOT_PROVIDED',
        };
        return `[${severityLevel}]:[${trace.requestId}][${trace.message.event}] ${JSON.stringify({
            timestamp,
            serviceName: trace.servicename,
            details: message.details,
            error: message.error,
        })}`;
    }
    info(moduleName, methodName, details) {
        this.logger.info({
            event: `${moduleName}.${methodName}`,
            details,
        });
    }
    warn(moduleName, methodName, details) {
        this.logger.warn({
            event: `${moduleName}.${methodName}`,
            details,
        });
    }
    error(moduleName, methodName, details, error) {
        this.logger.error({
            event: `${moduleName}.${methodName}`,
            details,
            error,
        });
    }
}
exports.default = new Logger();
//# sourceMappingURL=Logger.js.map