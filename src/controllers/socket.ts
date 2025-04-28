import { Server, Socket } from "socket.io";
const WebSocket = require("ws");
import { SendEmail } from "../utlis/common";
const User = require("../models/user");

interface ActiveUser {
  userId: string;
  socketIds: string[];
}

let activeUsers: ActiveUser[] = [];

const UserPreference = require("../models/userPreference");
const availableGroupSymbol = require("../models/availableGroupSymbol");
import dotenv from "dotenv";

dotenv.config();

let ws: WebSocket | null = null;
const subscribedSymbols: Set<string> = new Set();

export function connectFinnhubWebSocket(): void {
  ws = new WebSocket(
    `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
  );

  ws?.addEventListener("open", async () => {
    console.log("✅ Connected to Finnhub WebSocket");
    // subscribeToSymbol("BINANCE:BTCUSDT");
    const allSymbols = await availableGroupSymbol.find();
    allSymbols.forEach((symbol: any) => subscribeToSymbol(`${symbol.symbol}`));
  });

  ws?.addEventListener("close", () => {
    console.error("WebSocket closed. Reconnecting...");
    setTimeout(connectFinnhubWebSocket, 3000);
  });

  ws?.addEventListener("error", (error: any) => {
    console.error("WebSocket error:", error);
  });
}

export function subscribeToSymbol(symbol: string): void {
  if (
    ws &&
    ws.readyState === WebSocket.OPEN &&
    !subscribedSymbols.has(symbol)
  ) {
    console.log(`🔔 Subscribing to ${symbol}`);
    ws.send(JSON.stringify({ type: "subscribe", symbol }));
    subscribedSymbols.add(symbol);
  }
}

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("new-user-add", (userIdObject: { userId: string }) => {
      const userId = userIdObject?.userId;
      if (!userId) {
        console.error("User ID is undefined", userId);
        return;
      }
      const user = activeUsers.find((user) => user.userId === userId);

      if (user) {
        if (!user.socketIds.includes(socket.id)) {
          user.socketIds.push(socket.id);
        }
      } else {
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
  ws?.addEventListener("message", async (event: any) => {
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

        const users = await UserPreference.find({ websocketSymbol: symbol });

        users.forEach(async (user: any) => {
          const activeUser = activeUsers.find(
            (u) => u.userId === user.userId
          ) || { userId: user.userId, socketIds: [] };

          activeUser.socketIds.forEach((id) => {
            io.to(id).emit("get-real-time-indices", trade);
          });

          if (user.targetPrice && (price > user.targetPrice || price < user.targetPrice)) {
            // Fetch user details
            const dbUser = await User.findById(user.userId);
            if (dbUser && dbUser.email) {
              const direction = price > user.targetPrice ? "increased above" : "decreased below";
              await SendEmail(
                dbUser.email,
                user.symbol || user.websocketSymbol,
                direction,
                price,
                user.targetPrice
              );
            }
          }
        });
      }
    }
  });
};
