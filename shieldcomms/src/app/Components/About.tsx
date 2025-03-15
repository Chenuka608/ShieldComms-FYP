"use client"; // Mark as a client component to allow hooks like useRouter

import React from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook from next/navigation

const About = () => {
  const router = useRouter(); // Initialize the router

  // Function to handle the "Get Started" button click
  const handleGetStartedClick = () => {
    router.push("/application"); // Navigate to the /application page
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h2 className="text-4xl font-bold mb-6 text-center">About ShieldComms</h2>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl">
        ShieldComms is an advanced AI-powered cybersecurity solution designed to protect your digital communications. Whether you're dealing with emails or messaging platforms, ShieldComms helps identify and neutralize threats before they reach you.
      </p>

      {/* Key Features Section */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm text-center">
          <h3 className="text-xl font-semibold mb-4">Real-Time Threat Detection</h3>
          <p className="text-gray-700">Our AI-driven system scans emails and messages for phishing attempts, malware, and suspicious links in real time.</p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm text-center">
          <h3 className="text-xl font-semibold mb-4">AI & Machine Learning</h3>
          <p className="text-gray-700">Utilizing cutting-edge AI models, ShieldComms continuously improves to detect emerging threats faster and more accurately.</p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm text-center">
          <h3 className="text-xl font-semibold mb-4">User-Friendly Dashboard</h3>
          <p className="text-gray-700">Easily monitor your security status with a clean, intuitive dashboard that provides real-time insights and alerts.</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Stay Secure with ShieldComms</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of users who trust ShieldComms for their digital security. Get started today and take control of your online safety.
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleGetStartedClick} // Handle the click to navigate
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
