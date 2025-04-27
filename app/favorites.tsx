"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { useGeneration } from "@/hooks/useGeneration";
import ImageGrid from "@/components/ImageGrid";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { images } = useGeneration();

  // Only show images that are favorited
  const favoriteImages = images.filter(img => favorites.includes(img.id));

  return (
    <main className="flex flex-col min-h-screen items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Favorites</h2>
      <div className="w-full max-w-5xl">
        <ImageGrid 
          images={favoriteImages}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDelete={() => {}} // Optionally disable delete in favorites
        />
        {favoriteImages.length === 0 && (
          <div className="text-center text-zinc-500 mt-8">No favorite images yet.</div>
        )}
      </div>
    </main>
  );
}
