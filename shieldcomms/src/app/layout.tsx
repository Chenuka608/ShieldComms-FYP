import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ShowHero from "./components/ShowHero"; // 🔥 new component
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
       
        {children}
        <Footer />
      </body>
    </html>
  );
}
