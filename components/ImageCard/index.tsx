"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Star, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ImageData {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  // Only for GPT Image 1: store base64 if available for persistent caching
  b64?: string;
}

interface ImageCardProps {
  image: ImageData;
  onFavorite: (image: ImageData) => void;
  isFavorite?: boolean;
  onZoom: (image: ImageData) => void;
  onDelete: (id: string) => void;
  onEdit: (image: ImageData) => void;
}

export default function ImageCard({
  image,
  onFavorite,
  isFavorite = false,
  onZoom,
  onDelete,
  onEdit,
}: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success("Image copied to clipboard!");
    } catch {
      toast.error("Failed to copy image");
    }
  };

  return (
    <div 
      className="relative aspect-square rounded-md overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={e => {
        // Only trigger zoom if not clicking on a button
        if (!(e.target instanceof HTMLElement && e.target.closest('button'))) {
          onZoom(image);
        }
      }}
    >
      <div 
        className={cn(
          "absolute inset-0 bg-zinc-200 dark:bg-zinc-800 animate-pulse-slow",
          isLoading ? "opacity-100" : "opacity-0"
        )}
      />
      <Image
        src={image.url}
        alt={image.prompt}
        fill
        draggable={false}
        className={cn(
          "object-cover transition-all duration-300 ease-in-out animate-fadeIn",
          isHovered ? "scale-105" : "scale-100",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
      />
      
      {/* Overlay on hover */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ease-in-out",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Prompt text */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-3 text-white text-sm transition-all duration-300 ease-in-out",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        <p className="truncate">{image.prompt}</p>
      </div>
      
      {/* Action buttons */}
      <div 
        className={cn(
          "absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 ease-in-out",
          isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        )}
      >
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/30 border border-black/10 shadow-lg backdrop-blur-md hover:bg-white/40 transition-all hover:scale-[0.98] active:scale-95"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 text-zinc-700 drop-shadow" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/30 border border-black/10 shadow-lg backdrop-blur-md hover:bg-white/40 transition-all hover:scale-[0.98] active:scale-95"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 text-zinc-700 drop-shadow" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/30 border border-black/10 shadow-lg backdrop-blur-md hover:bg-white/40 transition-all hover:scale-[0.98] active:scale-95"
          title="Edit image"
          onClick={e => { e.stopPropagation(); onEdit(image); }}
        >
          <svg className="h-4 w-4 text-zinc-500 drop-shadow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.5 2.5 0 1 1 3.535 3.535L7.5 19.92l-4 1 1-4 14.362-14.433z"/></svg>
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "h-8 w-8 rounded-full bg-white/30 border border-black/10 shadow-lg backdrop-blur-md hover:bg-white/40 transition-all hover:scale-[0.98] active:scale-95",
            isFavorite && "text-yellow-400"
          )}
          onClick={() => onFavorite(image)}
        >
          <Star className={cn("h-4 w-4 text-zinc-700 drop-shadow", isFavorite && "fill-yellow-400")} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8 rounded-full bg-red-500/80 text-white border border-black/10 shadow-lg hover:bg-red-600/90 hover:scale-[0.98] active:scale-95"
          title="Delete image"
          onClick={() => onDelete(image.id)}
        >
          <Trash className="h-4 w-4 drop-shadow" />
        </Button>
      </div>
    </div>
  );
} 