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
exports.geytCurrentTimeData = exports.CalculateDaysDifference = exports.GetAccessToken = exports.SendEmail = exports.GenerateOtpNumber = void 0;
exports.GetUserIdFromToken = GetUserIdFromToken;
exports.generateMockData = generateMockData;
const nodemailer_1 = __importDefault(require("nodemailer"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const UserPreference = require("../models/userPreference");
const User = require("../models/user");
const AvailableGroupSymbol = require("../models/availableGroupSymbol");
const admin = require("firebase-admin");
const config_1 = require("../config/config");
const constants_1 = require("./constants");
const axios_1 = __importDefault(require("axios"));
const GenerateOtpNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    return otp_generator_1.default.generate(constants_1.OTP_LENGTH, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
});
exports.GenerateOtpNumber = GenerateOtpNumber;
const SendEmail = (email, stockName, direction, currentPrice, thresholdPrice) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: config_1.config.EMAIL_SERVER,
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: config_1.config.EMAIL_SENDING_ID,
            pass: config_1.config.EMAIL_SENDING_PWD,
        },
    });
    const mailOptions = {
        from: config_1.config.EMAIL_SENDING_ID,
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
    const info = yield transporter.sendMail(mailOptions);
    return info;
});
exports.SendEmail = SendEmail;
function GetUserIdFromToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!token) {
            return undefined;
        }
        try {
            const decodedToken = yield admin.auth().verifyIdToken(token);
            const user = yield User.findOne({ email: decodedToken.email });
            if (!user && !decodedToken.email) {
                return undefined;
            }
            else if (decodedToken.email && !user) {
                const payload = {
                    email: decodedToken.email,
                    firebaseId: decodedToken.uid,
                };
                const saveUser = new User(payload);
                yield saveUser.save();
                return saveUser;
            }
            else {
                return user;
            }
        }
        catch (error) {
            return undefined;
        }
    });
}
const GetAccessToken = (req) => {
    return req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : undefined;
};
exports.GetAccessToken = GetAccessToken;
const CalculateDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.CalculateDaysDifference = CalculateDaysDifference;
const geytCurrentTimeData = (symbolId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const websocketSymbol = yield AvailableGroupSymbol.findOne({ _id: symbolId });
    if (!websocketSymbol) {
        throw new Error("Symbol mapping not found for " + symbolId);
    }
    // Build the URL dynamically (use the correct symbol, not hardcoded)
    const response = yield axios_1.default.get(`https://finnhub.io/api/v1/quote?symbol=${websocketSymbol.symbol}&token=${config_1.config.FINNHUB_API_KEY}`);
    const data = response.data;
    if (!data || !data.t) {
        throw new Error("Invalid response fetching historical data from Finnhub: " +
            JSON.stringify(response.data));
    }
    // Email alert logic
    const userPreferences = yield UserPreference.find({ symbolId });
    for (const pref of userPreferences) {
        if (!pref.targetPrice)
            continue;
        const currentDirection = data.c > pref.targetPrice ? "above" : "below";
        if (pref.lastAlertedPrice !== data.c) {
            // Fetch user email
            const dbUser = yield User.findById(pref.userId);
            if (dbUser && dbUser.email) {
                const directionText = currentDirection === "above" ? "increased above" : "decreased below";
                yield (0, exports.SendEmail)(dbUser.email, websocketSymbol.symbol, directionText, data.c, pref.targetPrice);
                // Update lastAlertDirection
                pref.lastAlertDirection = currentDirection;
                pref.lastAlertedPrice = data.c;
                yield pref.save();
            }
        }
    }
    const formattedData = {
        symbolId: symbolId,
        websocketSymbol: websocketSymbol.websocketSymbol,
        group: websocketSymbol.group,
        symbol: websocketSymbol.symbol,
        date: new Date(data.t * 1000).toISOString().split("T")[0],
        open: (_a = data.o) !== null && _a !== void 0 ? _a : 0,
        high: (_b = data.h) !== null && _b !== void 0 ? _b : 0,
        low: (_c = data.l) !== null && _c !== void 0 ? _c : 0,
        close: (_d = data.c) !== null && _d !== void 0 ? _d : 0,
        percentage: (_e = data.dp) !== null && _e !== void 0 ? _e : 0,
        previousClose: (_f = data.pc) !== null && _f !== void 0 ? _f : 0,
        priceChangePrevious: (_g = data.d) !== null && _g !== void 0 ? _g : 0,
        current: (_h = data.c) !== null && _h !== void 0 ? _h : 0,
        volume: 0, // Because volume is not provided in /quote
    };
    return formattedData;
});
exports.geytCurrentTimeData = geytCurrentTimeData;
function generateMockData(symbol, startDate, endDate) {
    const data = [];
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
function random(min, max) {
    return Math.random() * (max - min) + min;
}
