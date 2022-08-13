"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const RequestContextManager_1 = __importDefault(require("./middlewares/RequestContextManager"));
const routes_1 = __importDefault(require("./routes"));
const errorHanlder_1 = require("./middlewares/errorHanlder");
const props_1 = __importDefault(require("./common/props"));
const Logger_1 = __importDefault(require("./utils/Logger"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
    }
    createServer() {
        this.prepareMiddlwares();
        console.log(routes_1.default.toString());
        this.app.listen(props_1.default.PORT, () => {
            Logger_1.default.info(Server.name, 'createServer', `Server is up and running at port ${props_1.default.PORT}`);
        });
        return this.app;
    }
    prepareMiddlwares() {
        this.app.all('*', RequestContextManager_1.default.createContext);
        this.app.use(cors_1.default);
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.json());
        this.app.use(routes_1.default);
        this.app.use(errorHanlder_1.handleError);
    }
}
new Server().createServer();
//# sourceMappingURL=server.js.map