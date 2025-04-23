"use client";

import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import io from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

export default function GlobalNotifier() {
  useEffect(() => {
    const socket = io("https://shieldcomms-fyp-production.up.railway.app", { 
      path: "/socket.io",
    });

    socket.on("new_discord_message", (data) => {
      toast.info(`📨 Discord: ${data.username} — ${getVerdict(data.prediction)}`);
    });

    socket.on("new_telegram_message", (data) => {
      toast.warn(`📨 Telegram: ${data.username} — ${getVerdict(data.prediction)}`);
    });

    socket.on("new_email_message", (data) => {
      toast.success(`📬 Email: "${data.subject}" — ${getVerdict(data.prediction)}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getVerdict = (prediction: number) => {
    if (prediction === 1) return "⚠️ Phishing";
    if (prediction === 0.5) return "🤔 Suspicious";
    return "✅ Legitimate";
  };

  return <ToastContainer position="bottom-right" autoClose={4000} pauseOnHover />;
}
