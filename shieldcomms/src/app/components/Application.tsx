"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface DecodedToken {
  id: string;
  discord?: boolean;
  telegram?: boolean;
  iat: number;
  exp: number;
}

const Application = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const provider = urlParams.get("provider");

    const savedDiscordToken = localStorage.getItem("discord_token");
    const savedTelegramToken = localStorage.getItem("telegram_token");

    const token =
      provider === "telegram"
        ? tokenFromUrl || savedTelegramToken
        : tokenFromUrl || savedDiscordToken;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.warn("⏳ Token expired!");
        localStorage.removeItem("discord_token");
        localStorage.removeItem("telegram_token");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(decoded);

      if (tokenFromUrl) {
        if (provider === "telegram") {
          localStorage.setItem("telegram_token", tokenFromUrl);
          router.push("/telegram-dashboard");
        } else {
          localStorage.setItem("discord_token", tokenFromUrl);
          router.push("/dashboard");
        }
        return;
      }
    } catch (err) {
      console.error("❌ Invalid token:", err);
      localStorage.removeItem("discord_token");
      localStorage.removeItem("telegram_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleDiscordLogin = () => {
    window.location.href = "https://shieldcomms-backend-302307126408.us-central1.run.app/auth/discord";
  };

  const handleTelegramStart = () => {
    window.open("https://t.me/ShieldCommsBot", "_blank");
    alert("✅ Message the ShieldComms Telegram bot, then come back to access the dashboard.");
    router.push("/telegram-dashboard");
  };

  const handleEmailStart = () => {
    alert("📧 Starting email inbox monitoring for ShieldComms...");
    router.push("/email-dashboard");
  };

  const handleBackToSocials = () => {
    localStorage.removeItem("discord_token");
    localStorage.removeItem("telegram_token");
    setUser(null);
    router.push("/application");
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Checking session...</p>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Assets/backg.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!user ? (
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-md w-full max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">ShieldComms</h1>
          <p className="text-gray-600">
            Choose a platform to start detecting phishing messages:
          </p>

          <button
            onClick={handleDiscordLogin}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700"
          >
            Login with Discord
          </button>

          <button
            onClick={handleTelegramStart}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700"
          >
            Open Telegram Bot
          </button>

          <button
            onClick={handleEmailStart}
            className="w-full bg-yellow-500 text-white py-3 px-6 rounded-xl hover:bg-yellow-600"
          >
            Open Email Dashboard
          </button>
        </div>
      ) : (
        <div className="text-center text-white">
          <p className="text-lg">You're logged in already.</p>
          <button
            onClick={handleBackToSocials}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Go back to Social Logins
          </button>
        </div>
      )}
    </section>
  );
};

export default Application;
