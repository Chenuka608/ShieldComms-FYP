"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const TelegramDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("https://sheildcomms-backend.com//api/telegram/messages");
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(sorted);
      } catch (error) {
        console.error("❌ Failed to fetch Telegram messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const socket = io("https://sheildcomms-backend.com/", {
      transports: ["websocket"],
      path: "/socket.io"
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server (telegram)");
    });

    socket.on("new_telegram_message", (msg) => {
      const verdict = String(msg.prediction).trim().toLowerCase();
      if (verdict.includes("phishing") || Number(msg.prediction) === 1) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);

        if (Notification.permission === "granted") {
          new Notification("⚠️ New phishing message detected from Telegram!");
        }

        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error("🔇 Audio error:", err));
        }
      }

      setMessages((prev) => [msg, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Loading Telegram messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pt-28 sm:px-8 pb-8">
      <audio ref={audioRef} src="/Assets/notification.mp3" preload="auto" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="currentColor" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-700">
            <path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zM93 178.2l-1.8-36.9 75.9-68.1-93.6 59.4-39-15.6 150.6-58.2-14.7 66.6-77.4 52.8z" />
          </svg>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 leading-tight">Telegram Messages</h2>
            <p className="text-sm text-gray-500">Live phishing predictions from your Telegram bot</p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              localStorage.removeItem("telegram_token");
              window.location.href = "/application";
            }}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition"
          >
            🔙 Back to Social Logins
          </button>
        </div>

        {showAlert && (
          <div className="bg-red-100 text-red-800 text-sm font-medium px-4 py-2 rounded-lg mb-6 shadow animate-pulse text-center">
            ⚠️ New phishing message detected from Telegram!
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg) => {
            const verdict = String(msg.prediction).trim().toLowerCase();
            const isPhishing = verdict.includes("phishing") || Number(msg.prediction) === 1;
            const isSuspicious = verdict.includes("suspicious") || Number(msg.prediction) === 0.5;

            return (
              <div
                key={msg._id}
                className={`rounded-xl shadow p-5 transition-all hover:scale-[1.01] ${
                  isPhishing
                    ? "bg-red-100 border border-red-300"
                    : isSuspicious
                    ? "bg-yellow-100 border border-yellow-300"
                    : "bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                  <p className="font-semibold text-base sm:text-lg">👤 User: {msg.username || msg.userId || "Unknown"}</p>
                  <p className="text-base font-medium">
                    🔍 Prediction:{" "}
                    <span
                      className={
                        isPhishing
                          ? "text-red-600"
                          : isSuspicious
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {isPhishing ? "⚠️ Phishing" : isSuspicious ? "🤔 Suspicious" : "✅ Legitimate"}
                    </span>
                  </p>
                </div>
                <p className="text-gray-800 mb-2">
                  💬 <strong>Message:</strong>{" "}
                  {msg.message || <span className="italic text-gray-500">(No content)</span>}
                </p>
                <p className="text-sm text-gray-700">
                  📊 <strong>Phishing:</strong> {parseFloat(msg.phishing_probability).toFixed(2)}% |{" "}
                  <strong>Legit:</strong> {parseFloat(msg.non_phishing_probability).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  🕒 {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Unknown time"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TelegramDashboard;
