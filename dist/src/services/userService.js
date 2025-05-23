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
exports.ComparePassword = exports.GenerateRefreshToken = exports.GenerateAccessToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const GenerateAccessToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return jsonwebtoken_1.default.sign({ email }, config_1.config.ACCESS_TOKEN_SECRET, { expiresIn: "365d" });
});
exports.GenerateAccessToken = GenerateAccessToken;
const GenerateRefreshToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return jsonwebtoken_1.default.sign({ email }, config_1.config.REFRESH_TOKEN_SECRET, {
        expiresIn: "365d",
    });
});
exports.GenerateRefreshToken = GenerateRefreshToken;
const ComparePassword = (candidatePassword, userPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isMatch = yield bcrypt_1.default.compare(candidatePassword, userPassword);
        return isMatch;
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : "Error comparing passwords");
    }
});
exports.ComparePassword = ComparePassword;
