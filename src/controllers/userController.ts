const UserPreference = require("../models/userPreference");
const User = require("../models/user");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const common = require("../utlis/common");

const bcrypt = require("bcrypt");
const userService = require("../services/userService");
import { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const accessToken = await userService.GenerateAccessToken(email);

  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    accessToken,
  });
  await user.save();

  res.json({ message: "Signup successful", response: user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Email not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  res.status(200).json({ response: user });
};

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
    res.status(200).json(symbols);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
