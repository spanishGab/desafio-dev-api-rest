"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextManager = exports.REQUEST_ID = void 0;
const uuid_1 = require("uuid");
exports.REQUEST_ID = (0, uuid_1.v4)();
class RequestContextManager {
    static createContext(req, res, next) {
        req.id = exports.REQUEST_ID;
        next();
    }
}
exports.RequestContextManager = RequestContextManager;
//# sourceMappingURL=RequestContextManager.js.map