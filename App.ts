import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { config } from "./src/config/config";
import "./src/config/db";
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
import userRouter from "./src/routers/user";
import historicalDataRouter from "./src/routers/historicalData";
import socketHandler, { connectFinnhubWebSocket } from "./src/controllers/socket";

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
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// connectFinnhubWebSocket();

socketHandler(io);
