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
        setImages(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Persist images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
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