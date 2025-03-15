import type { Metadata } from "next";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Hero from "./Components/Hero"
import "./globals.css";

export const metadata: Metadata = {
  title: "ShieldComms",
  description: "Secure your digital communications with AI-powered threat detection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar /> {/* Navbar always visible */}
        
        {/* Conditionally render Hero only on the homepage */}
        {typeof window !== "undefined" && window.location.pathname === "/" ? <Hero /> : null}

        {children} {/* This dynamically loads page content */}

        <Footer /> {/* Footer always visible */}
        
      </body>
    </html>
  );
}