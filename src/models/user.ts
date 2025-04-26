import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseId: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
