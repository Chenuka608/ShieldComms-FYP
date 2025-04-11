const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require("dotenv").config({ path: ".env.bot" });

// Debug: Confirm environment variables
console.log("🔐 Bot Token Loaded:", process.env.DISCORD_BOT_TOKEN ? "✅" : "❌");
console.log("🔐 JWT Token Loaded:", process.env.TEST_JWT_TOKEN ? "✅" : "❌");

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const text = message.content;

  try {
    // 🔍 Step 1: Send message to ML model
    const res = await axios.post(
      "http://127.0.0.1:6000/predict",
      { text },
      {
        headers: {
          Authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`, // Optional
        },
      }
    );

    // ✅ Step 2: Extract and interpret result
    const verdict = res.data.prediction;
    const phishing = res.data.phishing_probability.toFixed(2);
    const legit = res.data.non_phishing_probability.toFixed(2);

    // Reply in Discord
    await message.reply(
      `🛡️ **ShieldComms Verdict:** ${verdict}\n\n📊 **Phishing:** ${phishing}%\n✅ **Legitimate:** ${legit}%`
    );

    // Step 3: Convert prediction to numeric for DB
    const numericPrediction =
      verdict === "⚠️ Phishing" ? 1 :
      verdict === "🤔 Suspicious" ? 0.5 : 0;

    // 💾 Step 4: Log to backend
    await axios.post("http://127.0.0.1:5000/log-discord-message", {
      userId: message.author.id,
      username: message.author.username,
      message: message.content,
      prediction: numericPrediction,
      phishing_probability: res.data.phishing_probability,
      non_phishing_probability: res.data.non_phishing_probability,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Error checking phishing:", err.message);
    if (err.response) {
      console.error("🔎 Backend error:", err.response.data);
    }
    await message.reply("❌ Error: Could not check this message for phishing.");
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Start the bot
client.login(process.env.DISCORD_BOT_TOKEN);
