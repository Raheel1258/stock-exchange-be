import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreference extends Document {
  userId: string;
  symbolId: string;
  targetPrice?: number;
}

const UserPreferenceSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  symbolId: {
    type: Schema.Types.ObjectId,
    ref: "AvailableGroupSymbol",
  },
  symbol: { type: String },
  websocketSymbol: { type: String },
  targetPrice: { type: Number },
  lastAlertDirection: { type: String },
  lastAlertedPrice: { type: Number },
});

module.exports = mongoose.model<IUserPreference>(
  "UserPreference",
  UserPreferenceSchema
);
