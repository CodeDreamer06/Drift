"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateImages, GenerationRequest, editImages, EditRequest } from "@/lib/api";
import { ImageData } from "@/components/ImageCard";
import { getAllImages, addImages, deleteImage } from "@/lib/db";

const IMAGES_STORAGE_KEY = "drift-images";

export const useGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [sourceImages, setSourceImages] = useState<File[]>([]);

  // Helper: hydrate blob URLs from base64
  const hydrateImages = (imgs: ImageData[]): ImageData[] =>
    imgs.map(img => {
      if (img.model === "gpt-image-1" && img.b64) {
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

  // Load images from IndexedDB on mount, migrate from localStorage if needed
  useEffect(() => {
    let didCancel = false;
    const load = async () => {
      // Migrate from localStorage if present
      const stored = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: ImageData[] = JSON.parse(stored);
          await addImages(parsed);
          localStorage.removeItem(IMAGES_STORAGE_KEY);
        } catch {}
      }
      // Load from IndexedDB
      try {
        const all = await getAllImages();
        const hydrated = hydrateImages(all);
        if (!didCancel) setImages(hydrated.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      } catch {}
    };
    load();
    return () => { didCancel = true; };
  }, []);

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

  // Add new images to IndexedDB and state
  const addNewImages = async (newImages: ImageData[]) => {
    await addImages(newImages);
    const all = await getAllImages();
    const hydrated = hydrateImages(all);
    updateImages(hydrated.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  };

  // Delete image from IndexedDB and state
  const removeImage = async (id: string) => {
    await deleteImage(id);
    const all = await getAllImages();
    const hydrated = hydrateImages(all);
    updateImages(hydrated.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  };

  // === Source Image Management ===
  const addSourceImage = (file: File) => {
    // Optional: Add checks for file type, size, or duplicates if needed
    setSourceImages((prev) => [...prev, file]);
  };

  const removeSourceImage = (fileName: string) => {
    setSourceImages((prev) => prev.filter((file) => file.name !== fileName));
  };

  const clearSourceImages = () => {
    setSourceImages([]);
  };
  // ==============================

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
        ...(request.model === "gpt-image-1" && item.b64_json ? { b64: item.b64_json } : {})
      }));
      await addNewImages(newImages);
      return newImages;
    } catch (error) {
      console.error("Error in useGeneration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle image editing
  const edit = async (request: Omit<EditRequest, 'images' | 'apiKey'>) => {
    if (sourceImages.length === 0) {
      console.warn("Edit function called without source images.");
      // Optionally show a toast message to the user
      return;
    }
    setIsLoading(true);
    try {
      // Prepare the request for the editImages API call
      const editApiRequest: EditRequest = {
        ...request,
        images: sourceImages,
        // API key is handled within editImages, fetching from localStorage
      };

      const response = await editImages(editApiRequest);
      const now = new Date().toISOString();

      // Process the response - assuming single image edited result based on docs
      // Adjust if the API can return multiple edited images
      const newImages: ImageData[] = response.data
        .filter((item): item is { b64_json: string } & typeof item => typeof item.b64_json === 'string') // Expecting b64_json for edits
        .map((item) => ({
          id: uuidv4(),
          url: '', // Will be hydrated later
          b64: item.b64_json,
          prompt: request.prompt, // Use the edit prompt
          model: request.model, // Use the edit model
          createdAt: now,
        }));

      if (newImages.length > 0) {
        await addNewImages(newImages); // Add the edited image(s)
        clearSourceImages(); // Clear source images after successful edit
        return newImages;
      } else {
        console.warn("Edit operation did not return usable image data.");
        // Optionally show a toast message
      }

    } catch (error) {
      console.error("Error in useGeneration (edit):", error);
      // Error toast is likely handled within editImages
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    images,
    sourceImages,
    setImages: updateImages,
    generate,
    edit,
    removeImage,
    addSourceImage,
    removeSourceImage,
    clearSourceImages,
  };
};