"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const props_1 = __importDefault(require("../common/props"));
const internal_routes_1 = __importDefault(require("./internal.routes"));
const router = (0, express_1.Router)();
router.use(props_1.default.VERSION, internal_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map