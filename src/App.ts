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
import { ServiceAccount } from "firebase-admin";

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

// const serviceAccount = require("./services/finnhub-stock-firebase.json");

// const serviceAccount: ServiceAccount = {
//   projectId: config.FIREBASE_PROJECT_ID,
//   privateKey: config.FIREBASE_PRIVATE_KEY,
//   clientEmail: config.FIREBASE_CLIENT_EMAIL,
// };

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "finnhub-stock",
    privateKey:  "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxUMW7fw2HZQKp\nYQ8BmKtfAAIQrLiUfoPMcPCucR3TFB2Nr4WjTuGatGDtg/ttBh+Q/VRhFWawZEcf\nguLuj8Hi1MhApu+h7irHI5q3JapZN5t8Vym99DG3pjhsOunhGPCD1luDeYIQ5ZrX\nElxWCJZ2UhcQI5XQ/FrjjHIbhfvVT8W2lDibM4Ui10kUbpDzB/GjIeM2ptlEkvBR\nyEv35e76NUUG1KwMYtmEEfb8iVLEIsCNL6Ne/BgDnt8/S+7a8ze5mtLMJkh827eu\nU1UjWdjnRzSkq7d7iS/hZ5Zja8usJ6rGbOXPaR2oHmmfylAP6du+Lkp71DR8zWZS\nO2LkRFZZAgMBAAECggEAG6LZtr/2NViWghzJEHghmaRwLfYlrKtNUoN119J0kg4M\nDyXAv/PO8ORVSR+tg9AVAm2hhaImx65RcYVeZk1MrFR6w6zhI41x6GjRt+LseoxS\ntR4GuP8C8rs7Bw9lnXpcHkg+Ki85iPWoXQYVEymyfc2Mn6zUMGbsqZOdw1FuL1BF\njpeY9urgg4rE679oEghsmMKS/518na8dmyR81Cuig6uQ9LRpozNKPvv+U87IKIGB\nRSuz1/fV3GagZvaMGdyKitCGGcXgay5Tvm+2V5TlVuIRwk+Kt7vM1H0sliS4EW6n\nELRUD3jFg44wwj812zjWsN+66TgakMhLdFaqvZRrqwKBgQDkdi4gU1ngFhf/bUSl\nYCA/qx79Mc9/AMiP4WaaKMMhOmuj/EdCkO3oTdWCMEGiCdLyjth7m9cVHdegJSMD\nEutUQCPWZorkE4pVLsS0E+XPBoQfPUS7nkVcHcR1zXQZB4NpeQOPRVAobFvmjS6v\na0cFxR61JHGW2H4iSxp47dVZiwKBgQDGsFYQ5j+jT1sjpTnKDeyN1jKmAThWnSt5\nSCqogctUzYhGklgFQT0XjOvI+Z1+C1wHOBjzNvQYAbkkK535MSoAPLlw55TLx6WL\n1QVklwW9qzGEfv2yKVD+87gnG0q8oHApta+xskoOOZltRRwFCERNdxOfsYJgEPvW\n7YY21dxkKwKBgDeXVjQBdC4l0iMSKJEBKfe0IO9FTpM90o/ILho27vxH5edaPNDC\nyVEsl1Z9fYr7Tvw8rAqv6g82WsCaKMHXubGfhdjmzMcgxhliLvUOnm3YzQ947h+l\nLIV0rNhpbOWmQWDJ1IbpO88KRvZ7xi9jMD4EMCutuYIWHeMkWUWxwadvAoGAPIG6\n1A6qVpt2D9bjUGsJHPCcH/3DIG1greCSTRqpxzuIQqWSdJc3eZKKw3twwM/IyNIG\nlxqnHyB3N1KpGxgjyEq11nJP1/cGrRzENavgLbCStdzOeZEnf1zNOeuPyP266pjP\n1neLIeXcmXAwZj/sPQMEUN+H6qWBbCSNeOmL4l0CgYBREVdBTAD3K1lhA+phAh/w\nmPbXQqzqATx7auWf5CTWEwhOzTzu3brGgljfbAPmt6PstGIHEu97HBJkdJdLr4qE\nqbex0jEcu5AhLrldbezID4wtcGEiAG4mZsV7QeH5sqoaD/VUMiSmIIOFh1vQrzby\nrZ6L11X8udm+3ejXuDgdVA==\n-----END PRIVATE KEY-----\n",
    clientEmail: "firebase-adminsdk-fbsvc@finnhub-stock.iam.gserviceaccount.com",
  }),
});

// connectFinnhubWebSocket();

socketHandler(io);
