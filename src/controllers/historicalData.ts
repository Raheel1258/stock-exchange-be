import { Request, Response, response } from "express";
import axios from "axios";
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const Stock = require("../models/stock");
const common = require("../utlis/common");
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;

const getHistoricalData = async (symbolId: string) => {
  const websocketSymbol = await AvailableGroupSymbol.findOne({ _id: symbolId });

  if (!websocketSymbol) {
    throw new Error("Symbol mapping not found for " + symbolId);
  }

  // Build the URL dynamically (use the correct symbol, not hardcoded)
  const response = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${websocketSymbol.symbol}&token=${FINNHUB_API_KEY}`
  );

  const data = response.data;

  if (!data || !data.t) {
    throw new Error(
      "Invalid response fetching historical data from Finnhub: " +
        JSON.stringify(response.data)
    );
  }

  console.log({ data });

  const formattedData = [
    {
      date: new Date(data.t * 1000).toISOString().split("T")[0],
      open: data.o ?? 0,
      high: data.h ?? 0,
      low: data.l ?? 0,
      close: data.c ?? 0,
      volume: 0, // Because volume is not provided in /quote
    },
  ];

  return formattedData;
};

function generateMockData(symbol: string, startDate: string, endDate: string) {
  const data: any[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const open = random(100, 500);
    const close = random(100, 500);
    const high = Math.max(open, close) + random(0, 10);
    const low = Math.min(open, close) - random(0, 10);

    data.push({
      date: d.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(random(0.01, 1).toFixed(5)),
      symbol,
    });
  }

  return data;
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const fetchCurrentTimeData = async (req: Request, res: Response) => {
  try {
    const accessToken = await common.GetAccessToken(req);
    const existingUser = await common.GetUserIdFromToken(accessToken);

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const { symbolId } = req.body;

    if (!symbolId) {
      return res
        .status(400)
        .json({ message: "symbolId, startDate, and endDate are required" });
    }

    const data = await getHistoricalData(symbolId);

    return res.status(200).json({ success: true, response: data });
  } catch (error: any) {
    console.error("Error fetching historical data:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchHistoricalData = async (req: Request, res: Response) => {
  try {
    const accessToken = await common.GetAccessToken(req);
    const existingUser = await common.GetUserIdFromToken(accessToken);

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const { symbolId, startDate, endDate } = req.body;

    if (!symbolId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "symbolId, startDate, and endDate are required" });
    }

    const symbol = await AvailableGroupSymbol.findOne({ _id: symbolId });

    if (!symbol) {
      return res.status(404).json({ message: "Symbol not found" });
    }

    const response = await Stock.find({
      symbol: symbol.symbol,
      date: { $gte: startDate, $lte: endDate },
    });

    return res.status(200).json({ success: true, response: response });
  } catch (error: any) {
    console.error("Error fetching historical data:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
