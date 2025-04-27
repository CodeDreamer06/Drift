"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize on first render
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none, use initialValue
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that 
  // persists the new value to localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      if (typeof window === "undefined") return;
      
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };

  return [storedValue, setValue];
} 