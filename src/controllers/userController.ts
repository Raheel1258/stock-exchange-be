const UserPreference = require("../models/userPreference");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const common = require("../utils/common");
import { Request, Response } from "express";
import { geytCurrentTimeData } from "../utils/common";

export const saveUserPreference = async (req: Request, res: Response) => {
  const accessToken = await common.GetAccessToken(req);
  const existingUser = await common.GetUserIdFromToken(accessToken);
  if (!existingUser) {
    return res.status(401).json({ message: "User not found" });
  }

  const existingSymbol = await UserPreference.findOne({
    userId: existingUser._id,
  });

  const { symbolId, targetPrice } = req.body;

  const symbol = await AvailableGroupSymbol.findOne({ _id: symbolId });

  if (existingSymbol) {
    existingSymbol.targetPrice = targetPrice;
    existingSymbol.symbolId = symbolId;
    existingSymbol.symbol = symbol?.symbol;
    existingSymbol.websocketSymbol = symbol?.websocketSymbol;
    await existingSymbol.save();
    return res.json({
      message: "Preference updated!",
      response: existingSymbol,
    });
  }

  const response = await UserPreference.create({
    userId: existingUser._id,
    symbolId,
    targetPrice,
    symbol: symbol?.symbol,
    websocketSymbol: symbol?.websocketSymbol,
  });

  res.json({ message: "Preference saved and subscribed!", response: response });
};

export const getUserPreference = async (req: Request, res: Response) => {
  const accessToken = await common.GetAccessToken(req);
  const existingUser = await common.GetUserIdFromToken(accessToken);
  if (!existingUser) {
    return res.status(401).json({ message: "User not found" });
  }

  const existingSymbol = await UserPreference.findOne({
    userId: existingUser._id,
  });

  if (existingSymbol) {
    return res
      .status(200)
      .json({ message: "Preference found!", response: existingSymbol });
  } else {
    return res.status(400).json({ message: "Preference not found!" });
  }
};

export const createAvailableGroupSymbol = async (
  req: Request,
  res: Response
) => {
  try {
    const groupsData = req.body;

    if (!Array.isArray(groupsData)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    Promise.all(
      groupsData?.map(async (groupData: any) => {
        const { group, symbol, websocketSymbol } = groupData;
        const existingSymbol = await AvailableGroupSymbol.findOne({ symbol });
        if (!existingSymbol) {
          const newSymbol = new AvailableGroupSymbol({
            symbol: symbol,
            group,
            websocketSymbol: websocketSymbol,
          });
          await newSymbol.save();
        }
      })
    );

    res.status(201).json({ message: "Symbols created successfully" });
  } catch (error) {
    console.error("Error creating symbol:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all available symbols
export const getAvailableGroupSymbols = async (req: Request, res: Response) => {
  try {
    const symbols = await AvailableGroupSymbol.find();

    const currentTimeSymbol = await Promise.all(
      symbols.map(async (s: any) => {
        return await geytCurrentTimeData(s._id);
      })
    );

    res.status(200).json({ success: true, response: currentTimeSymbol });
  } catch (error) {
    console.error("Error fetching symbols:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
