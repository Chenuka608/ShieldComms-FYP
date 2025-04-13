"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const response = await fetch("https://shieldcomms-fyp-production.up.railway.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        alert("User registered successfully");
      } else {
        const errorText = await response.text();
        alert(`Failed to register: ${errorText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("https://shieldcomms-fyp-production.up.railway.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful");
        localStorage.setItem("token", data.token);
      } else {
        const errorText = await response.text();
        alert(`Invalid credentials: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/Assets/logo.png" alt="ShieldComms Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-blue-600 ml-2">ShieldComms</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4 relative">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-500"
            onClick={() => {
              setShowAuth(true);
              setIsSignUp(false);
            }}
          >
            Sign In
          </button>
          <button
            className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-100"
            onClick={() => {
              setShowAuth(true);
              setIsSignUp(true);
            }}
          >
            Sign Up
          </button>
        </div>

        {/* User Icon */}
        <Link href="/account" className="text-gray-600 hover:text-blue-600 ml-4">
          <FaUserCircle size={30} />
        </Link>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden px-6 py-4 space-y-2 bg-white shadow-md">
          <Link href="/" className="block text-gray-600 hover:text-blue-600">Home</Link>
          <Link href="/about" className="block text-gray-600 hover:text-blue-600">About</Link>
          <Link href="/pricing" className="block text-gray-600 hover:text-blue-600">Pricing</Link>
          <button
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg mt-4"
            onClick={() => {
              setShowAuth(true);
              setIsSignUp(false);
            }}
          >
            Sign In
          </button>
          <button
            className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-lg"
            onClick={() => {
              setShowAuth(true);
              setIsSignUp(true);
            }}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Fullscreen Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-lg m-4 relative">
            <h2 className="text-xl font-semibold text-center mb-4">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-3 p-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md mb-2"
              onClick={isSignUp ? handleSignUp : handleLogin}
            >
              {isSignUp ? "Create Account" : "Login"}
            </button>

            <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-md mb-2">
              Sign in with Google
            </button>

            <p
              className="text-sm text-center text-blue-600 mt-3 cursor-pointer"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </p>

            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setShowAuth(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
