"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE = "drift-api-key";

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    localStorage.removeItem(API_KEY_STORAGE);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
