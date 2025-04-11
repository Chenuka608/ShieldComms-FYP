// src/app/Components/ShowHero.tsx
"use client";

import { usePathname } from "next/navigation";
import Hero from "../components/Hero";

const ShowHero = () => {
  const pathname = usePathname();

  if (pathname === "/") {
    return <Hero />;
  }

  return null;
};

export default ShowHero;
