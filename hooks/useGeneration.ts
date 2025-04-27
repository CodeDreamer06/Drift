"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateImages, GenerationRequest } from "@/lib/api";
import { ImageData } from "@/components/ImageCard";

const IMAGES_STORAGE_KEY = "drift-images";

export const useGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);

  // Load images from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(IMAGES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ImageData[] = JSON.parse(stored);
        // For GPT Image 1 images, reconstruct blob URLs if b64 is present
        const hydrated = parsed.map(img => {
          if (
            img.model === "gpt-image-1" &&
            img.b64
          ) {
            // Always recreate blob URL from base64
            const byteString = atob(img.b64);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              uint8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            return { ...img, url };
          }
          return img;
        });
        setImages(hydrated);
      } catch {}
    }
  }, []);

  // Persist images to localStorage whenever they change
  useEffect(() => {
    // Limit to the most recent 20 images
    const toStore = images.slice(0, 20);
    try {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      // If quota exceeded, try storing fewer images
      for (let n = 15; n > 0; n -= 5) {
        try {
          localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images.slice(0, n)));
          break;
        } catch {}
      }
      // Optionally notify user (console for now)
      console.warn('Image history storage quota exceeded. Oldest images were dropped.');
    }
  }, [images]);

  // Cleanup function to revoke blob URLs
  const cleanupBlobUrls = (imagesToCleanup: ImageData[]) => {
    imagesToCleanup.forEach(image => {
      if (image.model === "gpt-image-1" && image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
    });
  };

  // Override setImages to handle blob URL cleanup
  const updateImages = (newImages: ImageData[]) => {
    cleanupBlobUrls(images);
    setImages(newImages);
  };

  const generate = async (request: GenerationRequest) => {
    setIsLoading(true);
    try {
      const response = await generateImages(request);
      
      const now = new Date().toISOString();
      const newImages: ImageData[] = response.data.filter((item): item is { url: string } & typeof item => typeof item.url === 'string').map((item) => ({
          id: uuidv4(),
          url: item.url,
          prompt: request.prompt,
          model: request.model,
          createdAt: now,
          // For GPT Image 1, persist base64 for future restoration
          ...(request.model === "gpt-image-1" && item.b64_json ? { b64: item.b64_json } : {})
        }));
      
      updateImages([...newImages, ...images]);
      return newImages;
    } catch (error) {
      console.error("Error in useGeneration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    images,
    setImages,
    generate
  };
};