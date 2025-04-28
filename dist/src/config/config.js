"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: Number(process.env.PORT) || 4080,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "default_secret_key",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret_key",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "default_secret_key",
    // Email Sending Option
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    EMAIL_SENDING_ID: process.env.EMAIL_SENDING_ID,
    EMAIL_SENDING_PWD: process.env.EMAIL_SENDING_PWD,
    // Feedback Email
    FEEDBACK_EMAIL_ID: process.env.FEEDBACK_EMAIL_ID,
    // S3 Keys
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    BUCKET_NAME: process.env.BUCKET_NAME,
    BUCKET_REGION: process.env.BUCKET_REGION,
    IMAGES_FOLDER_PATH: process.env.IMAGES_FOLDER_PATH,
    IMAGES_GALLERY_FOLDER_PATH: process.env.IMAGES_GALLERY_FOLDER_PATH,
    // finnhub api key
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
};
exports.config = config;
