const mongoose = require('mongoose');

const discordMessageSchema = new mongoose.Schema({
  userId: String,
  username: String,
  message: String,
  prediction: Number, // ✅ Store as a number
  phishing_probability: Number,
  non_phishing_probability: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiscordMessage', discordMessageSchema);
