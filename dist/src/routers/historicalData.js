"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const historicalDataController = require("../controllers/historicalData");
router.post("/fetchCurrentTimeData", historicalDataController.fetchCurrentTimeData);
router.post("/fetchHistoricalData", historicalDataController.fetchHistoricalData);
exports.default = router;
