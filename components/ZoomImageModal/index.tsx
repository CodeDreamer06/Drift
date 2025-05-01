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

async function compressImageFile(file: File, maxSizeMB = 1, maxDim = 1024): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise<File>((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((maxDim / width) * height);
          width = maxDim;
        } else {
          width = Math.round((maxDim / height) * width);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const ext = file.type === 'image/png' ? 'png' : 'jpeg';
          const compressedFile = new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, `.${ext}`), { type: blob.type });
          URL.revokeObjectURL(url);
          resolve(compressedFile);
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.8
      );
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export default function ZoomImageModal({
  image,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: ZoomImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !image?.url) return;
    let cancelled = false;
    async function fetchImageFile() {
      try {
        const res = await fetch(image.url);
        const blob = await res.blob();
        const ext = image.url.split('.').pop()?.split('?')[0] || 'png';
        await compressImageFile(new File([blob], `original.${ext}`, { type: blob.type }));
        if (!cancelled) setIsLoading(false);
      } catch {
        if (!cancelled) setIsLoading(true);
      }
    }
    fetchImageFile();
    return () => { cancelled = true; };
  }, [isOpen, image?.url]);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(image.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const ext = image.url.split('.').pop()?.split('?')[0] || 'png';
      const fileName = `${image.prompt?.replace(/\s+/g, '_').slice(0, 30) || image.id}.${ext}`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (_err) {
      console.error("Download failed", _err);
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
            <p className="text-sm mb-4">{image.prompt}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}