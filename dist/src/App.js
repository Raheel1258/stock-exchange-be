"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = require("./config/config");
require("./config/db");
const { Server } = require("socket.io");
const app = (0, express_1.default)();
const PORT = config_1.config.PORT || 3000;
// Middleware
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
// Routes
const user_1 = __importDefault(require("./routers/user"));
const historicalData_1 = __importDefault(require("./routers/historicalData"));
const socket_1 = __importDefault(require("./controllers/socket"));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/stock", historicalData_1.default);
app.get("/", (req, res) => {
    res.send("Hello from Node!");
});
const server = app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
const io = new Server(server, {
    cors: {
        origins: "*:*",
        methods: ["GET", "POST"],
    },
});
const admin = require("firebase-admin");
// const serviceAccount = require("./src/services/finnhub-stock-firebase.json");
const serviceAccount = {
    projectId: config_1.config.FIREBASE_PROJECT_ID,
    privateKey: config_1.config.FIREBASE_PRIVATE_KEY,
    clientEmail: config_1.config.FIREBASE_CLIENT_EMAIL,
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// connectFinnhubWebSocket();
(0, socket_1.default)(io);
