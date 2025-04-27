"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AdvancedOptionsProps {
  negativPrompt: string;
  onNegativePromptChange: (prompt: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
}

export default function AdvancedOptions({
  negativPrompt,
  onNegativePromptChange,
  temperature,
  onTemperatureChange,
}: AdvancedOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="animate-in overflow-hidden">
      <CardHeader className="pb-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Sliders className="h-4 w-4 mr-2" />
            Advanced Options
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 transition-transform duration-300 ease-in-out">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent 
        className={cn(
          "transition-all duration-300 ease-in-out grid overflow-hidden", 
          isExpanded ? "grid-rows-[1fr] pt-3" : "grid-rows-[0fr] pt-0"
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-zinc-700 dark:text-zinc-200">Temperature ({temperature.toFixed(1)})</div>
              <Slider 
                value={[temperature]} 
                min={0.1} 
                max={1.0} 
                step={0.1} 
                onValueChange={(value) => onTemperatureChange(value[0])}
                className="transition-all duration-300 ease-in-out"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="text-xs text-zinc-700 dark:text-zinc-200">Negative Prompt</div>
              <textarea
                value={negativPrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                placeholder="Things to exclude from the generated image..."
                className="w-full resize-none rounded-md border-none bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 px-3 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300 ease-in-out min-h-[80px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 