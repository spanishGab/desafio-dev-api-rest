"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cls_hooked_1 = __importDefault(require("cls-hooked"));
const uuid_1 = require("uuid");
const NAMESPACE = cls_hooked_1.default.createNamespace((0, uuid_1.v4)());
class RequestContextManager {
    static createContext(req, res, next) {
        NAMESPACE.bindEmitter(req);
        NAMESPACE.bindEmitter(res);
        const requestId = (0, uuid_1.v4)();
        req.id = requestId;
        NAMESPACE.run(() => {
            NAMESPACE.set('requestId', requestId);
            next();
        });
        return true;
    }
    static getRequestId() {
        return NAMESPACE.get('requestId');
    }
}
exports.default = RequestContextManager;
//# sourceMappingURL=RequestContextManager.js.map