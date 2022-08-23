"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const Logger_1 = __importDefault(require("../utils/Logger"));
const router = (0, express_1.Router)();
router.get(`/healthcheck`, (req, res) => {
    Logger_1.default.info('routes', 'healthcheck', {
        message: 'System is Healthy',
    });
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        uuid: req.id,
        message: http_status_codes_1.ReasonPhrases.OK,
    });
});
router.post(`/`);
router.post(`/deposit`);
router.get(`/balance`);
router.post(`/withdrawal`);
router.put(`/block-account`);
router.get(`/receipt`);
exports.default = router;
//# sourceMappingURL=internal.routes.js.map