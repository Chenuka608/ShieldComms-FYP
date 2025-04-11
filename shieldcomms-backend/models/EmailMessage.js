const mongoose = require("mongoose");

const EmailMessageSchema = new mongoose.Schema(
  {
    sender: String,
    subject: String,
    body: String,
    prediction: String,
    phishing_probability: Number,
    non_phishing_probability: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailMessage", EmailMessageSchema);
