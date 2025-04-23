import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalNotifier from "./components/GlobalNotifier"; // ✅ Add this
import "./globals.css";

export const metadata: Metadata = {
  title: "ShieldComms",
  description: "Secure your digital communications with AI-powered threat detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <GlobalNotifier /> {/* 🔔 Live notifications component */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
