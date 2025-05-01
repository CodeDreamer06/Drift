"use client";

import { useState } from "react";
import ImageCard, { ImageData } from "@/components/ImageCard";
import ZoomImageModal from "@/components/ZoomImageModal";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: ImageData[];
  favorites: string[];
  onToggleFavorite: (image: ImageData) => void;
  onDelete: (id: string) => void;
  addSourceImage: (file: File) => void;
}

export default function ImageGrid({ 
  images, 
  favorites,
  onToggleFavorite,
  onDelete,
  addSourceImage,
}: ImageGridProps) {
  const [zoomedImage, setZoomedImage] = useState<ImageData | null>(null);

  // Handler to fetch image as File and add to main prompt
  const handleEdit = async (image: ImageData) => {
    try {
      console.log(`[handleEdit] Fetching image: ${image.url}`);
      const res = await fetch(image.url);
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
      const blob = await res.blob();
      console.log(`[handleEdit] Blob details: size=${blob.size}, type=${blob.type}`);

      // Standardize to PNG for editing, but use a unique name
      const fileName = `edit-${image.id}.png`; // Use image ID for uniqueness
      const fileType = 'image/png';
      const file = new File([blob], fileName, { type: fileType });
      console.log(`[handleEdit] Created File: name=${file.name}, type=${file.type}, size=${file.size}`);

      addSourceImage(file);
      // Optionally, scroll/focus main prompt input here
    } catch (err) {
      console.error("[handleEdit] Error processing image for edit:", err);
      // Optionally toast error: `Failed to prepare image for editing: ${err.message}`
    }
  };

  return (
    <>
      <div 
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
          images.length === 0 && "grid-cols-1"
        )}
      >
        {images.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium mb-2">No images generated yet</p>
            <p className="text-muted-foreground text-sm">Enter a prompt and click &quot;Generate&quot; to create new images</p>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id}>
              <ImageCard 
                image={image}
                isFavorite={favorites.includes(image.id)}
                onFavorite={onToggleFavorite}
                onZoom={setZoomedImage}
                onDelete={onDelete}
                onEdit={handleEdit}
              />
            </div>
          ))
        )}
      </div>

      {zoomedImage && (
        <ZoomImageModal
          image={zoomedImage}
          isOpen={!!zoomedImage}
          onClose={() => setZoomedImage(null)}
          isFavorite={favorites.includes(zoomedImage.id)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}