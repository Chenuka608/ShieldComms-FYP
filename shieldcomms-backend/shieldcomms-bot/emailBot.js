const { MailSlurp } = require("mailslurp-client");
const axios = require("axios");
require("dotenv").config(); // ✅ Loads .env

const mailslurp = new MailSlurp({ apiKey: process.env.MAILSLURP_API_KEY });
const inboxId = process.env.MAILSLURP_INBOX_ID;
const processedEmailIds = new Set();

async function monitorInbox() {
  try {
    const inbox = await mailslurp.getInbox(inboxId);
    console.log(`📬 Monitoring inbox: ${inbox.emailAddress}`);

    const pollInterval = 3000;

    while (true) {
      try {
        const emailPreviews = await mailslurp.getEmails(inboxId, {
          unreadOnly: false,
          sortDirection: "DESC",
        });

        for (const preview of emailPreviews) {
          if (processedEmailIds.has(preview.id)) continue;

          const email = await mailslurp.getEmail(preview.id);
          if (!email.body) {
            console.warn(`⚠️ Skipping email "${email.subject}" — no body.`);
            continue;
          }

          console.log(`📨 Processing Email: ${email.subject}`);

          const headers = {};
          if (process.env.TEST_JWT_TOKEN) {
            headers.Authorization = `Bearer ${process.env.TEST_JWT_TOKEN}`;
          }

          const mlRes = await axios.post("https://shieldcomms-fyp.onrender.com/predict", {
            text: email.body,
          }, { headers });

          const {
            prediction,
            phishing_probability,
            non_phishing_probability,
          } = mlRes.data;

          await axios.post("https://shieldcomms-backend.com/log-email-message", {
            sender: email.from?.[0]?.emailAddress || "Unknown Sender",
            subject: email.subject || "(No Subject)",
            body: email.body,
            prediction,
            phishing_probability,
            non_phishing_probability,
          });

          console.log("✅ Email logged with prediction");
          processedEmailIds.add(preview.id);
        }
      } catch (err) {
        console.error("❌ Error checking emails:", err.message);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
}

monitorInbox();
