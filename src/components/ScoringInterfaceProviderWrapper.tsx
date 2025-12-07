"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import the provider to avoid SSR issues with Cache Components
const ScoringInterfaceProvider = dynamic(
  () => import("@/contexts/ScoringInterfaceContext").then((mod) => ({ default: mod.ScoringInterfaceProvider })),
  { ssr: false }
);

export default function ScoringInterfaceProviderWrapper({ children }: { children: ReactNode }) {
  return <ScoringInterfaceProvider>{children}</ScoringInterfaceProvider>;
}

