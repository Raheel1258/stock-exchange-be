"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const stockSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    open: {
        type: Number,
    },
    high: {
        type: Number,
    },
    low: {
        type: Number,
    },
    close: {
        type: Number,
    },
    volume: {
        type: Number,
    },
    symbol: {
        type: String,
    },
});
module.exports = mongoose_1.default.model("Stock", stockSchema);
