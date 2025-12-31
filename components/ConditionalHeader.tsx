"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  const isPublicAuthPath =
    !!pathname &&
    (pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/welcome") ||
      pathname.startsWith("/forget-password") ||
      pathname.startsWith("/reset-password"));

  if (isPublicAuthPath) return null;

  return (
    <div className="md:hidden">
      <Header />
    </div>
  );
}
