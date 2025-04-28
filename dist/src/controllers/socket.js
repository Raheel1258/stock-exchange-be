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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectFinnhubWebSocket = connectFinnhubWebSocket;
exports.subscribeToSymbol = subscribeToSymbol;
const WebSocket = require("ws");
const common_1 = require("../utils/common");
const User = require("../models/user");
let activeUsers = [];
const UserPreference = require("../models/userPreference");
const availableGroupSymbol = require("../models/availableGroupSymbol");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let ws = null;
const subscribedSymbols = new Set();
function connectFinnhubWebSocket() {
    ws = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);
    ws === null || ws === void 0 ? void 0 : ws.addEventListener("open", () => __awaiter(this, void 0, void 0, function* () {
        console.log("✅ Connected to Finnhub WebSocket");
        // subscribeToSymbol("BINANCE:BTCUSDT");
        const allSymbols = yield availableGroupSymbol.find();
        allSymbols.forEach((symbol) => subscribeToSymbol(`${symbol.symbol}`));
    }));
    ws === null || ws === void 0 ? void 0 : ws.addEventListener("close", () => {
        console.error("WebSocket closed. Reconnecting...");
        setTimeout(connectFinnhubWebSocket, 3000);
    });
    ws === null || ws === void 0 ? void 0 : ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
    });
}
function subscribeToSymbol(symbol) {
    if (ws &&
        ws.readyState === WebSocket.OPEN &&
        !subscribedSymbols.has(symbol)) {
        console.log(`🔔 Subscribing to ${symbol}`);
        ws.send(JSON.stringify({ type: "subscribe", symbol }));
        subscribedSymbols.add(symbol);
    }
}
exports.default = (io) => {
    io.on("connection", (socket) => {
        socket.on("new-user-add", (userIdObject) => {
            const userId = userIdObject === null || userIdObject === void 0 ? void 0 : userIdObject.userId;
            if (!userId) {
                console.error("User ID is undefined", userId);
                return;
            }
            const user = activeUsers.find((user) => user.userId === userId);
            if (user) {
                if (!user.socketIds.includes(socket.id)) {
                    user.socketIds.push(socket.id);
                }
            }
            else {
                activeUsers.push({ userId, socketIds: [socket.id] });
            }
            io.emit("get-users", activeUsers);
        });
        socket.on("disconnect", () => {
            activeUsers.forEach((user, index) => {
                user.socketIds = user.socketIds.filter((id) => id !== socket.id);
                if (user.socketIds.length === 0) {
                    activeUsers.splice(index, 1);
                }
            });
            io.emit("get-users", activeUsers);
        });
    });
    // 👇 Move this OUTSIDE the `connection` event!
    ws === null || ws === void 0 ? void 0 : ws.addEventListener("message", (event) => __awaiter(void 0, void 0, void 0, function* () {
        const parsed = JSON.parse(event.data);
        console.log({ parsed });
        if (parsed.type === "trade") {
            for (const trade of parsed.data) {
                const { s: symbol, p: price } = trade;
                const formattedTrade = {
                    date: new Date(trade.t).toISOString().split("T")[0],
                    open: trade.p,
                    high: trade.p,
                    low: trade.p,
                    close: trade.p,
                    volume: trade.v || 0,
                    symbol: trade.s,
                };
                console.log({ formattedTrade });
                const users = yield UserPreference.find({ websocketSymbol: symbol });
                users.forEach((user) => __awaiter(void 0, void 0, void 0, function* () {
                    const activeUser = activeUsers.find((u) => u.userId === user.userId) || { userId: user.userId, socketIds: [] };
                    activeUser.socketIds.forEach((id) => {
                        io.to(id).emit("get-real-time-indices", trade);
                    });
                    if (user.targetPrice) {
                        const currentDirection = price > user.targetPrice ? "above" : "below";
                        if (user.lastAlertedPrice !== price) {
                            // Fetch user details
                            const dbUser = yield User.findById(user.userId);
                            if (dbUser && dbUser.email) {
                                const direction = currentDirection === "above" ? "increased above" : "decreased below";
                                yield (0, common_1.SendEmail)(dbUser.email, user.symbol || user.websocketSymbol, direction, price, user.targetPrice);
                                // Update lastAlertDirection and lastAlertedPrice in DB
                                user.lastAlertDirection = currentDirection;
                                user.lastAlertedPrice = price;
                                yield user.save();
                            }
                        }
                    }
                }));
            }
        }
    }));
};
