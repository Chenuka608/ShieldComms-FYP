"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/about");
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      <Image
        src="/Assets/hero.jpg"
        alt="ShieldComms Hero"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold">ShieldComms</h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl">
          Secure your digital communications with AI-powered threat detection.
        </p>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleRedirect}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition duration-300 hover:bg-blue-500"
          >
            Get Started
          </button>
          <button
            onClick={handleRedirect}
            className="border border-blue-600 text-blue-600 bg-white px-6 py-3 rounded-lg text-lg font-medium transition duration-300 hover:bg-blue-100"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
