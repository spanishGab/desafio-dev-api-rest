"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("./utils/Logger"));
const app_1 = __importDefault(require("./app"));
const PORT = 8080;
class Server {
    static run() {
        app_1.default.listen(PORT, () => {
            Logger_1.default.info(Server.name, 'createServer', `Server is up and running at port ${PORT}`);
        });
    }
}
Server.run();
//# sourceMappingURL=server.js.map