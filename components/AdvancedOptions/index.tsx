"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CircleDashed, Circle, CircleSlash2 } from "lucide-react";
import { Model } from "@/components/ModelSelector";

interface AdvancedOptionsProps {
  negativPrompt: string;
  onNegativePromptChange: (prompt: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  selectedModel: Model;
  backgroundSetting: 'auto' | 'opaque' | 'transparent';
  onBackgroundSettingChange: (value: 'auto' | 'opaque' | 'transparent') => void;
  moderation?: 'auto' | 'low' | null;
  onModerationChange?: (value: 'auto' | 'low' | null) => void;
  outputCompression?: number | null;
  onOutputCompressionChange?: (value: number | null) => void;
  outputFormat?: 'png' | 'jpeg' | 'webp' | null;
  onOutputFormatChange?: (value: 'png' | 'jpeg' | 'webp' | null) => void;
}

export default function AdvancedOptions({
  negativPrompt,
  onNegativePromptChange,
  temperature,
  onTemperatureChange,
  selectedModel,
  backgroundSetting,
  onBackgroundSettingChange,
  moderation = 'auto',
  onModerationChange,
  outputCompression = 100,
  onOutputCompressionChange,
  outputFormat = 'png',
  onOutputFormatChange
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

            {/* Background Setting - Only for gpt-image-1 */}
            {selectedModel.id === 'gpt-image-1' && (
              <>
              <div className="space-y-2 pt-4">
                <Label htmlFor="background-setting">Background</Label>
                <div id="background-setting" className="flex gap-2 pt-1 flex-wrap">
                  {(['auto', 'opaque', 'transparent'] as const).map((option) => (
                    <Badge
                      key={option}
                      variant={backgroundSetting === option ? 'default' : 'secondary'}
                      onClick={() => onBackgroundSettingChange(option)}
                      className="cursor-pointer px-3 py-1 text-sm flex items-center gap-1.5"
                    >
                      {option === 'auto' && <CircleDashed className="h-3.5 w-3.5" />}
                      {option === 'opaque' && <Circle className="h-3.5 w-3.5" />}
                      {option === 'transparent' && <CircleSlash2 className="h-3.5 w-3.5" />}
                      {option.charAt(0).toUpperCase() + option.slice(1)} {/* Capitalize */} 
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Moderation Level */}
              <div className="space-y-2 pt-4">
                <Label htmlFor="moderation-setting">Moderation Level</Label>
                <div id="moderation-setting" className="flex gap-2 pt-1 flex-wrap">
                  {(['auto', 'low'] as const).map((option) => (
                    <Badge
                      key={option}
                      variant={moderation === option ? 'default' : 'secondary'}
                      onClick={() => onModerationChange && onModerationChange(option)}
                      className="cursor-pointer px-3 py-1 text-sm flex items-center gap-1.5"
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Control the content-moderation level for images generated by gpt-image-1. &quot;low&quot; is less restrictive. Default is &quot;auto&quot;.</div>
              </div>

              {/* Output Format */}
              <div className="space-y-2 pt-4">
                <Label htmlFor="output-format-setting">Output Format</Label>
                <div id="output-format-setting" className="flex gap-2 pt-1 flex-wrap">
                  {(['png', 'jpeg', 'webp'] as const).map((option) => (
                    <Badge
                      key={option}
                      variant={outputFormat === option ? 'default' : 'secondary'}
                      onClick={() => onOutputFormatChange && onOutputFormatChange(option)}
                      className="cursor-pointer px-3 py-1 text-sm flex items-center gap-1.5"
                    >
                      {option.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Choose the image output format. Default is PNG.</div>
              </div>

              {/* Output Compression (only for jpeg/webp) */}
              {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                <div className="space-y-2 pt-4">
                  <Label htmlFor="output-compression-setting">Output Compression</Label>
                  <Slider
                    value={[outputCompression ?? 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => onOutputCompressionChange && onOutputCompressionChange(value[0])}
                    className="transition-all duration-300 ease-in-out"
                  />
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Compression level for JPEG/WEBP (0-100%). Default is 100% (no compression).</div>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}