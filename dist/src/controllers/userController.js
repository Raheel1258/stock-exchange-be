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
exports.getAvailableGroupSymbols = exports.createAvailableGroupSymbol = exports.getUserPreference = exports.saveUserPreference = void 0;
const UserPreference = require("../models/userPreference");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const common = require("../utils/common");
const common_1 = require("../utils/common");
const saveUserPreference = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield common.GetAccessToken(req);
    const existingUser = yield common.GetUserIdFromToken(accessToken);
    if (!existingUser) {
        return res.status(401).json({ message: "User not found" });
    }
    const existingSymbol = yield UserPreference.findOne({
        userId: existingUser._id,
    });
    const { symbolId, targetPrice } = req.body;
    const symbol = yield AvailableGroupSymbol.findOne({ _id: symbolId });
    if (existingSymbol) {
        existingSymbol.targetPrice = targetPrice;
        existingSymbol.symbolId = symbolId;
        existingSymbol.symbol = symbol === null || symbol === void 0 ? void 0 : symbol.symbol;
        existingSymbol.websocketSymbol = symbol === null || symbol === void 0 ? void 0 : symbol.websocketSymbol;
        yield existingSymbol.save();
        return res.json({
            message: "Preference updated!",
            response: existingSymbol,
        });
    }
    const response = yield UserPreference.create({
        userId: existingUser._id,
        symbolId,
        targetPrice,
        symbol: symbol === null || symbol === void 0 ? void 0 : symbol.symbol,
        websocketSymbol: symbol === null || symbol === void 0 ? void 0 : symbol.websocketSymbol,
    });
    res.json({ message: "Preference saved and subscribed!", response: response });
});
exports.saveUserPreference = saveUserPreference;
const getUserPreference = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield common.GetAccessToken(req);
    const existingUser = yield common.GetUserIdFromToken(accessToken);
    if (!existingUser) {
        return res.status(401).json({ message: "User not found" });
    }
    const existingSymbol = yield UserPreference.findOne({
        userId: existingUser._id,
    });
    if (existingSymbol) {
        return res
            .status(200)
            .json({ message: "Preference found!", response: existingSymbol });
    }
    else {
        return res.status(400).json({ message: "Preference not found!" });
    }
});
exports.getUserPreference = getUserPreference;
const createAvailableGroupSymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupsData = req.body;
        if (!Array.isArray(groupsData)) {
            return res.status(400).json({ message: "Invalid data format" });
        }
        Promise.all(groupsData === null || groupsData === void 0 ? void 0 : groupsData.map((groupData) => __awaiter(void 0, void 0, void 0, function* () {
            const { group, symbol, websocketSymbol } = groupData;
            const existingSymbol = yield AvailableGroupSymbol.findOne({ symbol });
            if (!existingSymbol) {
                const newSymbol = new AvailableGroupSymbol({
                    symbol: symbol,
                    group,
                    websocketSymbol: websocketSymbol,
                });
                yield newSymbol.save();
            }
        })));
        res.status(201).json({ message: "Symbols created successfully" });
    }
    catch (error) {
        console.error("Error creating symbol:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createAvailableGroupSymbol = createAvailableGroupSymbol;
// Get all available symbols
const getAvailableGroupSymbols = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const symbols = yield AvailableGroupSymbol.find();
        const currentTimeSymbol = yield Promise.all(symbols.map((s) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, common_1.geytCurrentTimeData)(s._id);
        })));
        res.status(200).json({ success: true, response: currentTimeSymbol });
    }
    catch (error) {
        console.error("Error fetching symbols:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAvailableGroupSymbols = getAvailableGroupSymbols;
