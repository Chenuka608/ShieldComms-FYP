require("dotenv").config();

require("./discordBot");
require("./telegramBot");
require("./emailBot");

console.log("✅ All bots are running...");
console.log("📦 ENV Check:");
console.log("DISCORD_BOT_TOKEN:", !!process.env.DISCORD_BOT_TOKEN);
console.log("TELEGRAM_BOT_TOKEN:", !!process.env.TELEGRAM_BOT_TOKEN);
console.log("MAILSLURP_API_KEY:", !!process.env.MAILSLURP_API_KEY);
console.log("API_URL:", process.env.API_URL);
