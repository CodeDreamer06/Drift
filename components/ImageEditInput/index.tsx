"use client";

import { useState, useRef, useEffect, KeyboardEvent, DragEvent } from "react";
import { Sparkles, XCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageEditInputProps {
  onSubmit: (prompt: string, images: File[]) => Promise<void>;
  isLoading: boolean;
  initialPrompt?: string;
  initialImages?: File[];
  submitLabel?: string;
}

export default function ImageEditInput({
  onSubmit,
  isLoading,
  initialPrompt = "",
  initialImages = [],
  submitLabel = "Edit Image"
}: ImageEditInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [images, setImages] = useState<File[]>(initialImages);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    const newUrls: Record<string, string> = {};
    images.forEach(file => {
      newUrls[file.name] = URL.createObjectURL(file);
    });
    setPreviewUrls(newUrls);
    return () => {
      Object.values(newUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setImages(prev => [...prev, ...imageFiles]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveImage = (fileName: string) => {
    setImages(prev => prev.filter(f => f.name !== fileName));
  };

  const handleClearImages = () => setImages([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;
    await onSubmit(trimmedPrompt, images);
    setPrompt("");
    setImages([]);
  };

  return (
    <div 
      className="rounded-md border bg-card p-4 animate-in relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex flex-col items-center justify-center z-10 pointer-events-none">
          <UploadCloud className="h-12 w-12 text-primary mb-2" />
          <p className="text-primary font-medium">Drop images here</p>
        </div>
      )}
      <div className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the change you want to make..."
          rows={1}
          className="resize-none transition-all duration-300 ease-in-out min-h-[80px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
        />
        {images.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Editing {images.length} {images.length === 1 ? 'image' : 'images'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {images.map((file) => (
                <div key={file.name} className="relative group w-16 h-16 rounded overflow-hidden border">
                  {previewUrls[file.name] && (
                    <Image 
                      src={previewUrls[file.name]} 
                      alt={file.name} 
                      width={64} 
                      height={64} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <button 
                    onClick={() => handleRemoveImage(file.name)}
                    className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
                    aria-label={`Remove ${file.name}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleClearImages} 
              className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className={cn(
            "w-full transition-all duration-300 ease-in-out",
            images.length > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-900 dark:bg-zinc-200 dark:text-black",
            "text-white",
            isLoading ? "animate-pulse-slow" : "hover:scale-[0.98] active:scale-95",
            (!prompt.trim() || isLoading) && "opacity-60 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
              {images.length > 0 ? `Editing ${images.length} ${images.length === 1 ? 'Image' : 'Images'}...` : 'Editing...'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
