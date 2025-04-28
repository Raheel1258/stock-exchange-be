"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = require("../controllers/userController");
const router = express_1.default.Router();
router.post("/updateUserPreference", userController.saveUserPreference);
router.get("/getUserPreference", userController.getUserPreference);
router.get("/getAvailableGroupSymbols", userController.getAvailableGroupSymbols);
router.post("/createAvailableGroupSymbol", userController.createAvailableGroupSymbol);
exports.default = router;
