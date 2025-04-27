"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Model = {
  id: string;
  name: string;
  description: string;
  owned_by?: string;
  supportedSizes?: string[];
  supportedQualities?: string[];
};

export const models: Model[] = [
  // Black Forest Labs
  {
    id: "flux",
    name: "FLUX",
    description: "Black Forest Labs general purpose model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-4o",
    name: "FLUX 4o",
    description: "Black Forest Labs specialized model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-disney",
    name: "FLUX Disney",
    description: "Black Forest Labs Disney-style images",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-pixel",
    name: "FLUX Pixel",
    description: "Black Forest Labs pixel art style",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-anime",
    name: "FLUX Anime",
    description: "Black Forest Labs anime style",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-dark",
    name: "FLUX Dark",
    description: "Black Forest Labs dark style",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "flux-realism",
    name: "FLUX Realism",
    description: "Black Forest Labs photorealistic style",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "FLUX.1 [dev]",
    name: "FLUX.1 [dev]",
    description: "Black Forest Labs development model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "FLUX.1 [schnell]",
    name: "FLUX.1 [schnell]",
    description: "Black Forest Labs fast generation model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "FLUX.1 [pro]",
    name: "FLUX.1 [pro]",
    description: "Black Forest Labs professional model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "FLUX 1.1 [pro] ultra raw",
    name: "FLUX 1.1 [pro] ultra raw",
    description: "Black Forest Labs advanced raw output model",
    owned_by: "black-forest-labs",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  
  // Stable Diffusion
  {
    id: "flux-3d",
    name: "FLUX 3D",
    description: "Stable Diffusion 3D model generation",
    owned_by: "stablediffusion",
    supportedSizes: ["2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496", "1856x2304", "2304x1856", "1344x3136"]
  },
  {
    id: "stable-diffusion-xl-base",
    name: "Stable Diffusion XL Base",
    description: "Stable Diffusion XL base model",
    owned_by: "stablediffusion",
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  {
    id: "stable-diffusion-xl-lightning",
    name: "Stable Diffusion XL Lightning",
    description: "Fast version of Stable Diffusion XL",
    owned_by: "stablediffusion",
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  {
    id: "sd3.5",
    name: "Stable Diffusion 3.5",
    description: "Latest version of Stable Diffusion",
    owned_by: "stablediffusion",
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  
  // Google
  {
    id: "imagen-3.0-generate-001",
    name: "Imagen 3.0",
    description: "Google's Imagen 3.0 image generation model",
    owned_by: "google",
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  {
    id: "imagen-3.0-fast-generate-001",
    name: "Imagen 3.0 Fast",
    description: "Faster version of Google's Imagen 3.0",
    owned_by: "google",
    supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
  },
  
  // OpenAI
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    description: "OpenAI's GPT-based image generation model",
    owned_by: "openai",
    supportedSizes: ["1024x1024", "1536x1024", "1024x1536"],
    supportedQualities: ["low", "medium", "high", "auto"]
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "OpenAI's latest text-to-image model",
    owned_by: "openai",
    supportedSizes: ["1024x1024", "1792x1024", "1024x1792"],
    supportedQualities: ["standard", "hd"]
  },
  {
    id: "dall-e-2",
    name: "DALL-E 2",
    description: "OpenAI's previous text-to-image model",
    owned_by: "openai",
    supportedSizes: ["1024x1024", "512x512", "256x256"],
    supportedQualities: ["standard"]
  },
];


interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(true);
      }
      
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        
        e.preventDefault();
        const currentIndex = models.findIndex(model => model.id === selectedModel.id);
        let newIndex;
        
        if (e.key === "ArrowLeft") {
          newIndex = (currentIndex - 1 + models.length) % models.length;
        } else {
          newIndex = (currentIndex + 1) % models.length;
        }
        
        onModelChange(models[newIndex]);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [selectedModel, onModelChange]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] justify-between transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4" />
              {selectedModel.name}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0 animate-in">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              <CommandGroup>
                {models.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => {
                      onModelChange(model);
                      setOpen(false);
                    }}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedModel.id === model.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search models..." />
        <CommandList>
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup heading="Models">
            {models.map((model) => (
              <CommandItem
                key={model.id}
                onSelect={() => {
                  onModelChange(model);
                  setCommandOpen(false);
                }}
                className="transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span>{model.name}</span>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  {selectedModel.id === model.id && <Check className="h-4 w-4" />}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}