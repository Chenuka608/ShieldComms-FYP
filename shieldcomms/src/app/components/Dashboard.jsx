"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const DiscordDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("discord_token");

    const fetchMessages = async () => {
      try {
        const res = await axios.get("https://shieldcomms-backend.com/api/discord/messages", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sorted = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(sorted);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // ⏰ Refresh every 5 minutes
    const intervalId = setInterval(fetchMessages, 300000);

    // 🔌 Real-time socket connection (force websocket)
    const socket = io("https://shieldcomms-backend.com", {
      transports: ["websocket"],
      path: "/socket.io"
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected to backend!");
    });

    socket.on("new_discord_message", (msg) => {
      const pred = Number(msg.prediction);
      if (pred === 1) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        if (Notification.permission === "granted") {
          new Notification("⚠️ New phishing message detected on Discord!");
        }
        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error("🔇 Audio error:", err));
        }
      }
      setMessages((prev) => [msg, ...prev]);
    });

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, []);

  const getVerdictLabel = (pred) => {
    const num = Number(pred);
    if (num === 1) return "⚠️ Phishing";
    if (num === 0.5) return "🤔 Suspicious";
    return "✅ Legitimate";
  };

  const getVerdictColor = (pred) => {
    const num = Number(pred);
    if (num === 1) return "text-red-600";
    if (num === 0.5) return "text-yellow-600";
    return "text-green-600";
  };

  const getCardStyle = (pred) => {
    const num = Number(pred);
    if (num === 1) return "bg-red-100 border border-red-300";
    if (num === 0.5) return "bg-yellow-100 border border-yellow-300";
    return "bg-white";
  };

  const testNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("🔇 Test sound error:", err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Loading Discord messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pt-28 sm:px-8 pb-8">
      <div className="max-w-5xl mx-auto">
        <audio ref={audioRef} src="/Assets/notification.mp3" preload="auto" />

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-700" fill="currentColor">
            <path d="M107.84 8.63A105.15 105.15 0 0 0 84.5.5a74.29 74.29 0 0 0-3.52 7.29 97.29 97.29 0 0 0-35.84 0A74.29 74.29 0 0 0 41.62.5a105.25 105.25 0 0 0-23.34 8.13A110.89 110.89  0 0 0 .5 87.88a106.78 106.78 0 0 0 32.42 8.13 76.45 76.45 0 0 0 6.61-10.72 68.26 68.26 0 0 1-10.38-5.06 4.17 4.17 0 0 1-.37-6.88q.32-.25.69-.47c1.42-1 2.84-2 4.2-3.05A2.89 2.89 0 0 1 37 70a72.94 72.94 0 0 0 59.1 0 2.88 2.88 0 0 1 3.23.47c1.36 1 2.78 2 4.2 3.05a4.17 4.17 0 0 1 .32 6.92q-.33.24-.68.46a67.84 67.84 0 0 1-10.35 5.06A76.45 76.45 0 0 0 94.22 96a106.76 106.76 0 0 0 32.42-8.13A110.91 110.91 0 0 0 107.84 8.63ZM42.69 61.23c-5.59 0-10.18-5.14-10.18-11.45s4.49-11.46 10.18-11.46 10.3 5.15 10.18 11.46-4.48 11.45-10.18 11.45Zm41.76 0c-5.59 0-10.18-5.14-10.18-11.45s4.49-11.46 10.18-11.46S94.75 43.47 94.63 49.78s-4.48 11.45-10.18 11.45Z" />
          </svg>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 leading-tight">Discord Messages</h2>
            <p className="text-sm text-gray-500">Real-time phishing predictions from your Discord bot</p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <button
            onClick={() => {
              localStorage.removeItem("discord_token");
              window.location.href = "/application";
            }}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition"
          >
            🔙 Back to Social Logins
          </button>
        </div>

        {showAlert && (
          <div className="bg-red-100 text-red-800 text-sm font-medium px-4 py-2 rounded-lg mb-6 shadow animate-pulse text-center">
            ⚠️ New phishing message detected!
          </div>
        )}

        {/* Message cards */}
        <div className="space-y-6">
          {messages.map((msg) => {
            const verdict = getVerdictLabel(msg.prediction);
            const style = getCardStyle(msg.prediction);
            const color = getVerdictColor(msg.prediction);

            return (
              <div key={msg._id} className={`rounded-xl shadow p-5 transition-all hover:scale-[1.01] ${style}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                  <p className="font-semibold text-base sm:text-lg">👤 User: {msg.username || msg.userId || "Unknown"}</p>
                  <p className="text-base font-medium">
                    🔍 Prediction: <span className={color}>{verdict}</span>
                  </p>
                </div>
                <p className="text-gray-800 mb-2">
                  💬 <strong>Message:</strong> {msg.message || <span className="italic text-gray-500">(No content)</span>}
                </p>
                <p className="text-sm text-gray-700">
                  📊 <strong>Phishing:</strong> {parseFloat(msg.phishing_probability).toFixed(2)}% |{" "}
                  <strong>Legit:</strong> {parseFloat(msg.non_phishing_probability).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  🕒 {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "Unknown"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiscordDashboard;
