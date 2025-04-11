"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const EmailChecker = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/email/messages");
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEmails(sorted);
      } catch (error) {
        console.error("❌ Failed to fetch email messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server (email)");
    });

    socket.on("new_email_message", (email) => {
      console.log("📧 New real-time email:", email);
      const predictionValue = typeof email.prediction === "string" ? email.prediction : Number(email.prediction);

      if (predictionValue === "Phishing" || predictionValue === "⚠️ Phishing" || predictionValue === 1) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        if (Notification.permission === "granted") {
          new Notification("⚠️ New phishing email detected!");
        }
        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error("🔇 Audio error:", err));
        }
      }

      setEmails((prev) => [email, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const renderPrediction = (prediction) => {
    if (typeof prediction === "string") {
      if (prediction.includes("Phishing")) return { label: "⚠️ Phishing", color: "text-red-600" };
      if (prediction.includes("Suspicious")) return { label: "🤔 Suspicious", color: "text-yellow-600" };
      return { label: "✅ Legitimate", color: "text-green-600" };
    }
    if (prediction === 1) return { label: "⚠️ Phishing", color: "text-red-600" };
    if (prediction === 0.5) return { label: "🤔 Suspicious", color: "text-yellow-600" };
    return { label: "✅ Legitimate", color: "text-green-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Loading email messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 pt-28 sm:px-8 pb-8">
      <audio ref={audioRef} src="/Assets/notification.mp3" preload="auto" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-700">
            <path d="M502.3 190.8l-192-160c-21.4-17.8-53.2-17.8-74.6 0l-192 160C34.8 198.2 32 205.5 32 213.1v204.9c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V213.1c0-7.6-2.8-14.9-7.7-22.3zM256 75.4L448 240H64L256 75.4zM80 400V256l88 72.7c22.6 18.7 55.4 18.7 78 0L432 256v144H80z" />
          </svg>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 leading-tight">Email Messages</h2>
            <p className="text-sm text-gray-500">Live phishing predictions from your email bot</p>
          </div>
        </div>

        {showAlert && (
          <div className="bg-red-100 text-red-800 text-sm font-medium px-4 py-2 rounded-lg mb-6 shadow animate-pulse text-center">
            ⚠️ New phishing email detected!
          </div>
        )}

        <div className="space-y-6">
          {emails.length === 0 ? (
            <p className="text-center text-gray-600">No emails logged yet.</p>
          ) : (
            emails.map((email) => {
              const verdict = renderPrediction(email.prediction);

              return (
                <div
                  key={email._id}
                  className={`rounded-xl shadow p-5 transition-all hover:scale-[1.01] ${
                    verdict.label === "⚠️ Phishing" ? "bg-red-100 border border-red-300" :
                    verdict.label === "🤔 Suspicious" ? "bg-yellow-100 border border-yellow-300" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                    <p className="font-semibold text-base sm:text-lg">
                      📧 From: {email.sender || "Unknown Sender"}
                    </p>
                    <p className="text-base font-medium">
                      🔍 Prediction: <span className={verdict.color}>{verdict.label}</span>
                    </p>
                  </div>

                  <p className="text-gray-800 mb-2">
                    💬 <strong>Subject:</strong> {email.subject || <span className="italic text-gray-500">(No subject)</span>}
                  </p>

                  <p className="text-sm text-gray-700">
                    📊 <strong>Phishing:</strong> {parseFloat(email.phishing_probability).toFixed(2)}% | <strong>Legit:</strong> {parseFloat(email.non_phishing_probability).toFixed(2)}%
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    🕒 {new Date(email.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailChecker;
