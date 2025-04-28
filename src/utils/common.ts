import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import { Request } from "express";
const UserPreference = require("../models/userPreference");

const User = require("../models/user");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const admin = require("firebase-admin");

import { config } from "../config/config";
import { OTP_EMAIL_SUBJECT, OTP_LENGTH } from "./constants";
import axios from "axios";

export const GenerateOtpNumber = async (): Promise<string> => {
  return otpGenerator.generate(OTP_LENGTH, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const SendEmail = async (
  email: string,
  stockName: string,
  direction: string,
  currentPrice: number,
  thresholdPrice: number
): Promise<any> => {
  const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVER,
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.EMAIL_SENDING_ID,
      pass: config.EMAIL_SENDING_PWD,
    },
  });

  const mailOptions = {
    from: config.EMAIL_SENDING_ID,
    to: email,
    subject: "Stock Alert Notification",
    html: `<p>Hi,<br />
    This is a notification that <strong>${stockName}</strong> has just <strong>${direction}</strong> your set threshold.<br /><br />
    <strong>Current Price:</strong> $${currentPrice}<br />
    <strong>Your Alert Price:</strong> $${thresholdPrice}<br /><br />
    We wanted to keep you updated as per your alert settings.<br />
    <br />If you have any questions or need to adjust your alerts, please visit your dashboard or contact our support team.<br /><br />
    Best Regards,<br />
    Stock Market Team
  </p>`
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export async function GetUserIdFromToken(token: string | undefined) {
  if (!token) {
    return undefined;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ email: decodedToken.email });

    if (!user && !decodedToken.email) {
      return undefined;
    } else if (decodedToken.email && !user) {
      const payload = {
        email: decodedToken.email,
        firebaseId: decodedToken.uid,
      };

      const saveUser = new User(payload);
      await saveUser.save();

      return saveUser;
    } else {
      return user;
    }
  } catch (error) {
    return undefined;
  }
}

export const GetAccessToken = (req: Request): string | undefined => {
  return req.headers.authorization
    ? req.headers.authorization.replace("Bearer ", "")
    : undefined;
};

export const CalculateDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const geytCurrentTimeData = async (symbolId: string) => {
  const websocketSymbol = await AvailableGroupSymbol.findOne({ _id: symbolId });

  if (!websocketSymbol) {
    throw new Error("Symbol mapping not found for " + symbolId);
  }

  // Build the URL dynamically (use the correct symbol, not hardcoded)
  const response = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${websocketSymbol.symbol}&token=${config.FINNHUB_API_KEY}`
  );

  const data = response.data;

  if (!data || !data.t) {
    throw new Error(
      "Invalid response fetching historical data from Finnhub: " +
      JSON.stringify(response.data)
    );
  }

  // Email alert logic
  const userPreferences = await UserPreference.find({ symbolId});
  for (const pref of userPreferences) {
    if (pref.targetPrice && (data.c > pref.targetPrice || data.c < pref.targetPrice)) {
      // Fetch user email
      const dbUser = await User.findById(pref.userId);
      if (dbUser && dbUser.email) {
        const direction = data.c > pref.targetPrice ? "increased above" : "decreased below";
        await SendEmail(
          dbUser.email,
          websocketSymbol.symbol,
          direction,
          data.c,
          pref.targetPrice
        );
      }
    }
  }

  const formattedData = {
    symbolId: symbolId,
    websocketSymbol: websocketSymbol.websocketSymbol,
    group: websocketSymbol.group,
    symbol: websocketSymbol.symbol,
    date: new Date(data.t * 1000).toISOString().split("T")[0],
    open: data.o ?? 0,
    high: data.h ?? 0,
    low: data.l ?? 0,
    close: data.c ?? 0,
    percentage: data.dp ?? 0,
    previousClose: data.pc ?? 0,
    priceChangePrevious: data.d ?? 0,
    current: data.c ?? 0,
    volume: 0, // Because volume is not provided in /quote
  };

  return formattedData;
};

export function generateMockData(symbol: string, startDate: string, endDate: string) {
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
