const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config(); // ✅ Loads .env

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ Telegram bot token not found.");
  process.exit(1);
}

console.log("✅ Starting ShieldComms Telegram Bot...");

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (err) => console.error("📛 Polling Error:", err.message));
bot.on("webhook_error", (err) => console.error("📛 Webhook Error:", err.message));

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || "Unknown";
  const messageText = msg.text;

  if (!messageText || messageText.trim() === "") {
    bot.sendMessage(chatId, "⚠️ Please send a valid message.");
    return;
  }

  try {
    // 🔍 Send message to ML model
    const response = await axios.post("https://shieldcomms-backend-302307126408.us-central1.run.app/predict", {
      text: messageText,
    });

    const {
      prediction,
      phishing_probability,
      non_phishing_probability,
    } = response.data;

    // 🟡 Smarter reply logic
    let reply;
    if (prediction === "⚠️ Phishing") {
      reply = "⚠️ *Phishing detected!*\nBe cautious with this message.";
    } else if (prediction === "🤔 Suspicious") {
      reply = "🤔 *Suspicious message.*\nPlease verify manually.";
    } else {
      reply = "✅ *This message looks safe.*";
    }

    // 💾 Log to backend
    await axios.post("https://shieldcomms-backend-302307126408.us-central1.run.app/log-telegram-message", {
      userId: chatId,
      username,
      message: messageText,
      prediction,
      phishing_probability,
      non_phishing_probability,
      timestamp: new Date().toISOString()
    });

    // 💬 Reply to user
    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

  } catch (error) {
    console.error("❌ Telegram Bot Error:", error.message);
    if (error.response) console.error("🛑 API error:", error.response.data);
    bot.sendMessage(chatId, "🚫 Could not analyze your message.");
  }
});

console.log("🤖 Telegram bot is live and polling...");
