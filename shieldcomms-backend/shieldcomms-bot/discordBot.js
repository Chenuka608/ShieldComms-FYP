const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require("dotenv").config(); // ✅ Loads .env

console.log("🔐 Bot Token Loaded:", process.env.DISCORD_BOT_TOKEN ? "✅" : "❌");
console.log("🔐 JWT Token Loaded:", process.env.TEST_JWT_TOKEN ? "✅" : "❌");

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
    const headers = {};
    if (process.env.TEST_JWT_TOKEN) {
      headers.Authorization = `Bearer ${process.env.TEST_JWT_TOKEN}`;
    }

    const res = await axios.post("https://shieldcomms-fyp.onrender.com/predict", { text }, { headers });

    const verdict = res.data.prediction;
    const phishing = res.data.phishing_probability.toFixed(2);
    const legit = res.data.non_phishing_probability.toFixed(2);

    await message.reply(
      `🛡️ **ShieldComms Verdict:** ${verdict}\n\n📊 **Phishing:** ${phishing}%\n✅ **Legitimate:** ${legit}%`
    );

    const numericPrediction = verdict === "⚠️ Phishing" ? 1 : verdict === "🤔 Suspicious" ? 0.5 : 0;

    await axios.post("https://shieldcomms-backend-302307126408.us-central1.run.app/log-discord-message", {
      userId: message.author.id,
      username: message.author.username,
      message: text,
      prediction: numericPrediction,
      phishing_probability: res.data.phishing_probability,
      non_phishing_probability: res.data.non_phishing_probability,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Discord Bot Error:", err.message);
    if (err.response) console.error("🔎 Backend error:", err.response.data);
    await message.reply("❌ Error: Could not check this message for phishing.");
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

client.login(process.env.DISCORD_BOT_TOKEN);
