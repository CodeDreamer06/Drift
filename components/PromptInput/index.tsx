"use client";

import { useState, useRef, useEffect, KeyboardEvent, DragEvent } from "react";
import { Sparkles, XCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImageSize, ImageQuality } from "@/components/SettingsPanel";
import { GenerationRequest, EditRequest } from "@/lib/api";
import { ImageData } from '@/components/ImageCard';
import Image from 'next/image';

interface PromptInputProps {
  generate: (request: GenerationRequest) => Promise<ImageData[] | undefined>;
  edit: (request: Omit<EditRequest, 'images' | 'apiKey'>) => Promise<ImageData[] | undefined>;
  addSourceImage: (file: File) => void;
  removeSourceImage: (fileName: string) => void;
  clearSourceImages: () => void;
  sourceImages: File[];
  isLoading: boolean;
  model: string;
  size: ImageSize;
  quality: ImageQuality;
  negativePrompt?: string;
  temperature?: number;
  backgroundSetting?: 'auto' | 'opaque' | 'transparent';
}

export default function PromptInput({
  generate,
  edit,
  addSourceImage,
  removeSourceImage,
  clearSourceImages,
  sourceImages,
  isLoading,
  model,
  size,
  quality,
  negativePrompt,
  temperature,
  backgroundSetting
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const newUrls: Record<string, string> = {};
    sourceImages.forEach(file => {
      newUrls[file.name] = URL.createObjectURL(file);
    });
    setPreviewUrls(newUrls);

    return () => {
      Object.values(newUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [sourceImages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    if (sourceImages.length > 0) {
      edit({ 
        prompt: trimmedPrompt, 
        model, 
        ...(negativePrompt && { negative_prompt: negativePrompt }), 
        ...(temperature !== undefined && { temperature }),
        ...(backgroundSetting && { background: backgroundSetting })
      });
    } else {
      generate({ 
        prompt: trimmedPrompt, 
        model, 
        size, 
        quality, 
        n: 1, 
        negativePrompt: negativePrompt || undefined, 
        temperature,
        background: backgroundSetting
      });
      setPrompt("");
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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );
      imageFiles.forEach(addSourceImage);
      e.dataTransfer.clearData();
    }
  };

  const isEditing = sourceImages.length > 0;

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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Prompt</h3>
          <div className="text-xs text-zinc-400 dark:text-zinc-500">Press / to focus</div>
        </div>
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate..."
          rows={1}
          className="resize-none transition-all duration-300 ease-in-out min-h-[80px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
        />

        {sourceImages.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Editing {sourceImages.length} {sourceImages.length === 1 ? 'image' : 'images'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {sourceImages.map((file) => (
                <div key={file.name} className="relative group w-16 h-16 rounded overflow-hidden border">
                  <Image 
                    src={previewUrls[file.name]} 
                    alt={file.name} 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-cover" 
                  />
                  <button 
                    onClick={() => removeSourceImage(file.name)}
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
              onClick={clearSourceImages} 
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
            isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-900 dark:bg-zinc-200 dark:text-black",
            "text-white",
            isLoading ? "animate-pulse-slow" : "hover:scale-[0.98] active:scale-95",
            (!prompt.trim() || isLoading) && "opacity-60 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin-slow" />
              {isEditing ? `Editing ${sourceImages.length} ${sourceImages.length === 1 ? 'Image' : 'Images'}...` : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {isEditing ? `Edit ${sourceImages.length} ${sourceImages.length === 1 ? 'Image' : 'Images'}` : 'Generate'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}