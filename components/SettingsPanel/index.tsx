"use client";

import { useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Model } from "@/components/ModelSelector";

// These are fallback sizes and qualities if the model doesn't specify any
export type ImageSize = string;
export type ImageQuality = string;

const DEFAULT_SIZES = ["1024x1024", "1024x1792", "1792x1024"];
const DEFAULT_QUALITIES = ["standard", "hd"];

// --- Model-specific allowed sizes ---
const GPT_IMAGE_1_SIZES = ["1024x1024", "1024x1536", "1536x1024"];
const FLUX_SIZES = [
  "2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496",
  "1856x2304", "2304x1856", "1344x3136"
];

function getAvailableSizes(model: Model): string[] {
  if (model.id === "gpt-image-1") return GPT_IMAGE_1_SIZES;
  if (model.id.toLowerCase().includes("flux")) return FLUX_SIZES;
  // Dalle 2/3 and all others use default
  return model.supportedSizes || DEFAULT_SIZES;
}

interface SettingsPanelProps {
  size: ImageSize;
  onSizeChange: (size: ImageSize) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  quality: ImageQuality;
  onQualityChange: (quality: ImageQuality) => void;
  selectedModel: Model;
}

export default function SettingsPanel({
  size,
  onSizeChange,
  quantity,
  onQuantityChange,
  quality,
  onQualityChange,
  selectedModel,
}: SettingsPanelProps) {
  // For keyboard shortcuts
  // Get available sizes for the current model
  const availableSizes = getAvailableSizes(selectedModel);
  
  // Get available qualities for the current model
  const availableQualities = selectedModel.supportedQualities || DEFAULT_QUALITIES;
  
  // Ensure the current size is valid for this model
  useEffect(() => {
    if (!availableSizes.includes(size)) {
      // If current size is not supported, switch to the first available size
      onSizeChange(availableSizes[0]);
    }
  }, [selectedModel, availableSizes, size, onSizeChange]);
  
  // Ensure the current quality is valid for this model
  useEffect(() => {
    if (!availableQualities.includes(quality)) {
      // If current quality is not supported, switch to the first available quality
      onQualityChange(availableQualities[0]);
    }
  }, [selectedModel, availableQualities, quality, onQualityChange]);
  
  // Keyboard shortcuts for quantity and quality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Quantity shortcuts
      if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        onQuantityChange(parseInt(e.key));
        return;
      }
      // Quality shortcuts (q, w, e, r)
      const keys = ["q", "w", "e", "r"];
      const idx = keys.indexOf(e.key.toLowerCase());
      if (idx !== -1 && idx < availableQualities.length) {
        e.preventDefault();
        onQualityChange(availableQualities[idx]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onQuantityChange, onQualityChange, availableQualities]);

  return (
    <Card className="animate-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <Settings2 className="h-4 w-4 mr-2" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Image Size</div>
          <Select value={size} onValueChange={(value) => onSizeChange(value as ImageSize)}>
            <SelectTrigger className="w-full transition-all duration-300 ease-in-out hover:border-foreground">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {availableSizes.map((sizeOption) => {
                // Parse dimensions for display
                const [width, height] = sizeOption.split('x').map(Number);
                let label = sizeOption;
                
                // Create a more user-friendly label
                if (width === height) {
                  label = `Square (${width}×${height})`;
                } else if (width > height) {
                  label = `Landscape (${width}×${height})`;
                } else {
                  label = `Portrait (${width}×${height})`;
                }
                
                return (
                  <SelectItem key={sizeOption} value={sizeOption} className="transition-colors">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Number of Images (press 1-4)</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant={quantity === num ? "default" : "outline"}
                size="sm"
                onClick={() => onQuantityChange(num)}
                className={
                  quantity === num
                    ? "flex-1 bg-zinc-900 text-white dark:bg-zinc-200 dark:text-black border border-zinc-900 dark:border-zinc-200 transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95"
                    : "flex-1 bg-white text-black border border-zinc-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95"
                }
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Quality</div>
          <div className="flex gap-2 my-4">
            {availableQualities.map((qualityOption) => {
              const label = qualityOption.charAt(0).toUpperCase() + qualityOption.slice(1);
              const selected = quality === qualityOption;
              return (
                <button
                  key={qualityOption}
                  type="button"
                  onClick={() => onQualityChange(qualityOption)}
                  className={
                    `px-4 py-2 rounded-full border transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                    `
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}