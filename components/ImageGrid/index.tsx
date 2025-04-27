"use client";

import { useState } from "react";
import ImageCard, { ImageData } from "@/components/ImageCard";
import ZoomImageModal from "@/components/ZoomImageModal";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: ImageData[];
  favorites: string[];
  onToggleFavorite: (image: ImageData) => void;
}

export default function ImageGrid({ 
  images, 
  favorites,
  onToggleFavorite,
}: ImageGridProps) {
  const [zoomedImage, setZoomedImage] = useState<ImageData | null>(null);

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
            <div key={image.id} className="animate-fadeIn" style={{ animationDelay: `${Math.random() * 0.3}s` }}>
              <ImageCard 
                image={image}
                isFavorite={favorites.includes(image.id)}
                onFavorite={onToggleFavorite}
                onZoom={setZoomedImage}
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