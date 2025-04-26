import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { config } from "./config/config";
import "./config/db";
const { Server } = require("socket.io");

const app: Application = express();
const PORT: number = config.PORT;

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

app.use([userRouter, historicalDataRouter]);

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

const serviceAccount = require("./services/finnhub-stock-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


connectFinnhubWebSocket();

socketHandler(io);
