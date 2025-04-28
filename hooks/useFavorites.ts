"use client";

import { useState, useEffect } from "react";
import { ImageData } from "@/components/ImageCard";
import { toast } from "sonner";

// IndexedDB configuration
const DB_NAME = "drift-image-db";
const DB_VERSION = 2;
const STORE_NAME = "favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteImages, setFavoriteImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true);

        if (typeof window === "undefined") return;

        // Open the database
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object store if it doesn't exist
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Get all favorites
          const transaction = db.transaction(STORE_NAME, "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const images = getAllRequest.result as ImageData[];
            setFavoriteImages(images);
            setFavorites(images.map(img => img.id));
            setIsLoading(false);
          };
          
          getAllRequest.onerror = () => {
            console.error("Error getting favorites");
            setIsLoading(false);
          };
        };

        request.onerror = (event) => {
          console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Error initializing IndexedDB:", error);
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  // Toggle favorite status
  const toggleFavorite = async (image: ImageData) => {
    try {
      if (typeof window === "undefined") return;

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        // Check if already favorited
        const isFavorite = favorites.includes(image.id);
        
        if (isFavorite) {
          // Remove from favorites
          const deleteRequest = store.delete(image.id);
          
          deleteRequest.onsuccess = () => {
            setFavorites(prev => prev.filter(id => id !== image.id));
            setFavoriteImages(prev => prev.filter(img => img.id !== image.id));
            toast.success("Removed from favorites");
          };
          
          deleteRequest.onerror = () => {
            console.error("Error removing from favorites");
            toast.error("Failed to remove from favorites");
          };
        } else {
          // Add to favorites
          const addRequest = store.add(image);
          
          addRequest.onsuccess = () => {
            setFavorites(prev => [...prev, image.id]);
            setFavoriteImages(prev => [...prev, image]);
            toast.success("Added to favorites");
          };
          
          addRequest.onerror = () => {
            console.error("Error adding to favorites");
            toast.error("Failed to add to favorites");
          };
        }
      };
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  return {
    favorites,
    favoriteImages,
    isLoading,
    toggleFavorite
  };
} 