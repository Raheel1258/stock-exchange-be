"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHistoricalData = exports.fetchCurrentTimeData = void 0;
const common_1 = require("../utils/common");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const Stock = require("../models/stock");
const common = require("../utils/common");
const fetchCurrentTimeData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = yield common.GetAccessToken(req);
        const existingUser = yield common.GetUserIdFromToken(accessToken);
        if (!existingUser) {
            return res.status(401).json({ message: "User not found" });
        }
        const { symbolId } = req.body;
        if (!symbolId) {
            return res
                .status(400)
                .json({ message: "symbolId, startDate, and endDate are required" });
        }
        const data = yield (0, common_1.geytCurrentTimeData)(symbolId);
        return res.status(200).json({ success: true, response: data });
    }
    catch (error) {
        console.error("Error fetching historical data:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.fetchCurrentTimeData = fetchCurrentTimeData;
const fetchHistoricalData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = yield common.GetAccessToken(req);
        const existingUser = yield common.GetUserIdFromToken(accessToken);
        if (!existingUser) {
            return res.status(401).json({ message: "User not found" });
        }
        const { symbolId, startDate, endDate } = req.body;
        if (!symbolId || !startDate || !endDate) {
            return res
                .status(400)
                .json({ message: "symbolId, startDate, and endDate are required" });
        }
        const allSymbols = yield AvailableGroupSymbol.find();
        const symbol = allSymbols.find((s) => s._id.toString() === symbolId);
        if (!symbol) {
            return res.status(404).json({ message: "Symbol not found" });
        }
        const response = yield Stock.find({
            symbol: symbol.symbol,
            date: { $gte: startDate, $lte: endDate },
        });
        const currentTimeSymbol = yield Promise.all(allSymbols.map((s) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, common_1.geytCurrentTimeData)(s._id);
        })));
        return res.status(200).json({
            success: true,
            response: {
                historicalData: response,
                currentTimeData: currentTimeSymbol,
            },
        });
    }
    catch (error) {
        console.error("Error fetching historical data:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.fetchHistoricalData = fetchHistoricalData;
