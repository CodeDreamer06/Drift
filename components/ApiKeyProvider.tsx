"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ApiKey {
  key: string;
  usage: number[]; // timestamps (ms) of requests in the last minute
  rpm?: number; // requests per minute, default 5
}

interface ApiKeyContextType {
  apiKeys: ApiKey[];
  addApiKey: (key: string, rpm?: number) => void;
  removeApiKey: (key: string) => void;
  getAvailableKey: () => string | null;
  getUsage: (key: string) => number;
  isAllLimited: () => boolean;
  clearAllKeys: () => void;
  markUsage: (key: string) => void;
  setRpm: (key: string, rpm: number) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEYS_STORAGE = "drift-api-keys";
const MAX_RPM = 5;

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Load keys from storage
  useEffect(() => {
    const stored = localStorage.getItem(API_KEYS_STORAGE);
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save keys to storage
  useEffect(() => {
    localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Add a new API key
  const addApiKey = (key: string, rpm: number = MAX_RPM) => {
    setApiKeys(prev => {
      if (prev.find(k => k.key === key)) return prev;
      return [...prev, { key, usage: [], rpm }];
    });
  };

  // Remove an API key
  const removeApiKey = (key: string) => {
    setApiKeys(prev => prev.filter(k => k.key !== key));
  };

  // Clear all API keys
  const clearAllKeys = () => setApiKeys([]);

  // Get usage count for a key in the last minute
  const getUsage = (key: string) => {
    const k = apiKeys.find(k => k.key === key);
    if (!k) return 0;
    const now = Date.now();
    return k.usage.filter(ts => now - ts < 60_000).length;
  };

  // Get the next available key for rotation
  const getAvailableKey = () => {
    const now = Date.now();
    // Filter out keys that are at or above their rpm (default 5)
    const available = apiKeys.filter(k => k.usage.filter(ts => now - ts < 60_000).length < (k.rpm || MAX_RPM));
    if (available.length === 0) return null;
    // Rotate: pick the one with the least recent usage
    available.sort((a, b) => {
      const aLast = a.usage.length > 0 ? a.usage[a.usage.length - 1] : 0;
      const bLast = b.usage.length > 0 ? b.usage[b.usage.length - 1] : 0;
      return aLast - bLast;
    });
    return available[0].key;
  };

  // Check if all keys are limited
  const isAllLimited = () => {
    const now = Date.now();
    return apiKeys.length > 0 && apiKeys.every(k => k.usage.filter(ts => now - ts < 60_000).length >= (k.rpm || MAX_RPM));
  };

  // Mark usage for a key (should be called after a successful request)
  const markUsage = (key: string) => {
    setApiKeys(prev => prev.map(k => {
      if (k.key !== key) return k;
      const now = Date.now();
      // Only keep timestamps in the last minute
      const usage = [...k.usage.filter(ts => now - ts < 60_000), now];
      return { ...k, usage };
    }));
  };

  // Set RPM for a key
  const setRpm = (key: string, rpm: number) => {
    setApiKeys(prev => prev.map(k => k.key === key ? { ...k, rpm } : k));
  };

  return (
    <ApiKeyContext.Provider value={{ apiKeys, addApiKey, removeApiKey, getAvailableKey, getUsage, isAllLimited, clearAllKeys, markUsage, setRpm }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
