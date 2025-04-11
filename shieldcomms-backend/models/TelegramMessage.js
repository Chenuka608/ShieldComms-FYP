// models/TelegramMessage.js

const mongoose = require("mongoose");

const TelegramMessageSchema = new mongoose.Schema(
  {
    userId: String,
    username: String,
    message: String,
    prediction: String,
    phishing_probability: Number,
    non_phishing_probability: Number,
  },
  {
    timestamps: true, // ✅ Add this!
  }
);

module.exports = mongoose.model("TelegramMessage", TelegramMessageSchema);
