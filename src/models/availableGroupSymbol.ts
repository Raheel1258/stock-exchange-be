import mongoose from "mongoose";

const AvailableGroupSymbolSchema = new mongoose.Schema({
  symbol: { type: String },
  group: { type: String },
  websocketSymbol: { type: String },
});

module.exports = mongoose.model(
  "AvailableGroupSymbol",
  AvailableGroupSymbolSchema
);
