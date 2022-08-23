"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const http_status_codes_1 = require("http-status-codes");
const requestErrors_1 = require("../errors/requestErrors");
const Logger_1 = __importDefault(require("../utils/Logger"));
function handleError(err, req, res, next) {
    Logger_1.default.info('errorHandler', 'handleError', err.message);
    if (err instanceof requestErrors_1.RequestError) {
        const errorResponse = err.toJSON();
        Logger_1.default.error('errorHandler', 'handleError', errorResponse);
        return res.status(err.httpStatusCode).json(errorResponse);
    }
    if (err instanceof SyntaxError) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            id: req.id,
            code: String(http_status_codes_1.StatusCodes.BAD_REQUEST),
            description: err.message,
        });
    }
    return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        id: req.id,
        code: String(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR),
        description: http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
}
exports.handleError = handleError;
//# sourceMappingURL=errorHanlder.js.map