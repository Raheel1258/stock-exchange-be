import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { config } from "./config/config";
import "./config/db";
const { Server } = require("socket.io");

const app: Application = express();
const PORT: number = config.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Routes
import userRouter from "./routers/user";
import historicalDataRouter from "./routers/historicalData";
import socketHandler, { connectFinnhubWebSocket } from "./controllers/socket";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/stock", historicalDataRouter);

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
  type: config.FIREBASE_TYPE,
  project_id: config.FIREBASE_PROJECT_ID,
  private_key_id: config.FIREBASE_PRIVATE_KEY_ID,
  private_key: config.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: config.FIREBASE_CLIENT_EMAIL,
  client_id: config.FIREBASE_CLIENT_ID,
  auth_uri: config.FIREBASE_AUTH_URI,
  token_uri: config.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: config.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: config.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: config.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// connectFinnhubWebSocket();

socketHandler(io);
