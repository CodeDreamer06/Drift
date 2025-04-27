"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, Copy, Star, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageData } from "@/components/ImageCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ZoomImageModalProps {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (image: ImageData) => void;
}

export default function ZoomImageModal({
  image,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ZoomImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = useCallback(async () => {
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
  }, [image]);

  const handleCopy = useCallback(async () => {
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
  }, [image]);

  // F, D, C keyboard shortcuts (only when dialog is open)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      onToggleFavorite(image);
    } else if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      handleDownload();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      handleCopy();
    }
  }, [isOpen, image, onToggleFavorite, handleDownload, handleCopy]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden animate-in">
        <DialogTitle className="sr-only">Image Details</DialogTitle>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 z-10 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="relative aspect-[3/2] w-full">
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
              className={cn(
                "object-contain transition-all duration-300 ease-in-out",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
            />
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-sm">{image.model}</h3>
                <p className="text-muted-foreground text-xs">{new Date(image.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95 gap-1.5"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95 gap-1.5"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className={cn(
                    "transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95 gap-1.5",
                    isFavorite && "text-yellow-500"
                  )}
                  onClick={() => onToggleFavorite(image)}
                >
                  <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-500")} />
                  {isFavorite ? "Favorited" : "Favorite"}
                </Button>
              </div>
            </div>
            <p className="text-sm">{image.prompt}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 