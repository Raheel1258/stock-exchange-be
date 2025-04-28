"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
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
    type: config_1.config.FIREBASE_TYPE,
    project_id: config_1.config.FIREBASE_PROJECT_ID,
    private_key_id: config_1.config.FIREBASE_PRIVATE_KEY_ID,
    private_key: (_a = config_1.config.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    client_email: config_1.config.FIREBASE_CLIENT_EMAIL,
    client_id: config_1.config.FIREBASE_CLIENT_ID,
    auth_uri: config_1.config.FIREBASE_AUTH_URI,
    token_uri: config_1.config.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: config_1.config.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: config_1.config.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: config_1.config.FIREBASE_UNIVERSE_DOMAIN,
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// connectFinnhubWebSocket();
(0, socket_1.default)(io);
