import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  open: {
    type: Number,
  },
  high: {
    type: Number,
  },
  low: {
    type: Number,
  },
  close: {
    type: Number,
  },
  volume: {
    type: Number,
  },
  symbol: {
    type: String,
  },
});

module.exports = mongoose.model("Stock", stockSchema);
