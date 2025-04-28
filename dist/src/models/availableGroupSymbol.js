"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AvailableGroupSymbolSchema = new mongoose_1.default.Schema({
    symbol: { type: String },
    group: { type: String },
    websocketSymbol: { type: String },
    fullName: { type: String },
});
module.exports = mongoose_1.default.model("AvailableGroupSymbol", AvailableGroupSymbolSchema);
