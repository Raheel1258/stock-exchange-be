import express from "express";
const router = express.Router();
const historicalDataController = require("../controllers/historicalData");

router.post(
  "/fetchCurrentTimeData",
  historicalDataController.fetchCurrentTimeData
);

router.post(
  "/fetchHistoricalData",
  historicalDataController.fetchHistoricalData
)

export default router;
