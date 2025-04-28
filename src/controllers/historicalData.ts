import { Request, Response } from "express";
import { geytCurrentTimeData } from "../utils/common";
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const Stock = require("../models/stock");
const common = require("../utils/common");

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

    const data = await geytCurrentTimeData(symbolId);

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

    const allSymbols = await AvailableGroupSymbol.find();

    const symbol = allSymbols.find((s: any) => s._id.toString() === symbolId);

    if (!symbol) {
      return res.status(404).json({ message: "Symbol not found" });
    }

    const response = await Stock.find({
      symbol: symbol.symbol,
      date: { $gte: startDate, $lte: endDate },
    });

    const currentTimeSymbol = await Promise.all(
      allSymbols.map(async (s: any) => {
        return await geytCurrentTimeData(s._id);
      })
    );

    return res.status(200).json({
      success: true,
      response: {
        historicalData: response,
        currentTimeData: currentTimeSymbol,
      },
    });
  } catch (error: any) {
    console.error("Error fetching historical data:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
