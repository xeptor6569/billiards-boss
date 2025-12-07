"use client";

import { useState, useEffect } from "react";

export type ScoringInterface = "immersive" | "simple";

const STORAGE_KEY = "billiards-boss-scoring-interface";
const DEFAULT_INTERFACE: ScoringInterface = "immersive";

export function useScoringInterface() {
  const [interfaceType, setInterfaceType] = useState<ScoringInterface>(DEFAULT_INTERFACE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY) as ScoringInterface | null;
    if (stored === "immersive" || stored === "simple") {
      setInterfaceType(stored);
    }
    setIsLoaded(true);
  }, []);

  const setInterface = (type: ScoringInterface) => {
    setInterfaceType(type);
    localStorage.setItem(STORAGE_KEY, type);
  };

  return { interfaceType, setInterface, isLoaded };
}

