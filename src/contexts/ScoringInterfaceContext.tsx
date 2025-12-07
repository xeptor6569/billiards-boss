"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ScoringInterface = "immersive" | "simple";

const STORAGE_KEY = "billiards-boss-scoring-interface";
const DEFAULT_INTERFACE: ScoringInterface = "immersive";

interface ScoringInterfaceContextType {
  interfaceType: ScoringInterface;
  setInterface: (type: ScoringInterface) => void;
  isLoaded: boolean;
}

const ScoringInterfaceContext = createContext<ScoringInterfaceContextType | undefined>(undefined);

export function ScoringInterfaceProvider({ children }: { children: ReactNode }) {
  const [interfaceType, setInterfaceType] = useState<ScoringInterface>(DEFAULT_INTERFACE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as ScoringInterface | null;
      if (stored === "immersive" || stored === "simple") {
        setInterfaceType(stored);
      }
      setIsLoaded(true);
    }
  }, []);

  const setInterface = (type: ScoringInterface) => {
    setInterfaceType(type);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, type);
    }
  };

  return (
    <ScoringInterfaceContext.Provider value={{ interfaceType, setInterface, isLoaded }}>
      {children}
    </ScoringInterfaceContext.Provider>
  );
}

export function useScoringInterface() {
  const context = useContext(ScoringInterfaceContext);
  if (context === undefined) {
    throw new Error("useScoringInterface must be used within a ScoringInterfaceProvider");
  }
  return context;
}

