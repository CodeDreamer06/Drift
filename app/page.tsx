"use client";

import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import SettingsPanel, { ImageQuality, ImageSize } from "@/components/SettingsPanel";
import AdvancedOptions from "@/components/AdvancedOptions";
import ImageGrid from "@/components/ImageGrid";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import ApiKeySettings from "@/components/ApiKeySettings";
import { ApiKeyProvider, useApiKey } from "@/components/ApiKeyProvider";
import { Model } from "@/components/ModelSelector";
import { useGeneration } from "@/hooks/useGeneration";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFavorites } from "@/hooks/useFavorites";

// Default models
const models: Model[] = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "OpenAI's latest text-to-image model",
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    description: "OpenAI model with image editing capabilities",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Highly detailed and artistic images",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    description: "Fast, open-source image generation",
  },
];

function Home() {
  // Model selection state
  const [selectedModel, setSelectedModel] = useLocalStorage<Model>("selectedModel", models[0]);
  
  // Settings state
  const [size, setSize] = useLocalStorage<ImageSize>("imageSize", "1024x1024");
  const [quantity, setQuantity] = useLocalStorage<number>("quantity", 1);
  const [quality, setQuality] = useLocalStorage<ImageQuality>("quality", "standard");
  
  // Advanced options state
  const [negativePrompt, setNegativePrompt] = useLocalStorage<string>("negativePrompt", "");
  const [temperature, setTemperature] = useLocalStorage<number>("temperature", 0.7);
  const [backgroundSetting, setBackgroundSetting] = useLocalStorage<'auto' | 'opaque' | 'transparent'>("backgroundSetting", "auto");
  const [moderation, setModeration] = useLocalStorage<'auto' | 'low' | null>("moderation", 'auto');
  const [outputFormat, setOutputFormat] = useLocalStorage<'png' | 'jpeg' | 'webp' | null>("outputFormat", 'png');
  const [outputCompression, setOutputCompression] = useLocalStorage<number | null>("outputCompression", 100);
  
  // API key context
  const { 
    // getAvailableKey, // Commented out - unused
    // isAllLimited, // Commented out - unused
    // markUsage // Commented out - unused
  } = useApiKey();
  
  // Generation hook
  const { 
    isLoading, 
    images, 
    generate, 
    removeImage, 
    edit, 
    addSourceImage, 
    removeSourceImage, 
    sourceImages,
    clearSourceImages
  } = useGeneration();
  const { favorites, toggleFavorite } = useFavorites();
  
  // Delete image handler
  const handleDeleteImage = (id: string) => {
    removeImage(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      <Header 
        selectedModel={selectedModel} 
        onModelChange={setSelectedModel} 
      />
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar: stacks on top on mobile, left on desktop */}
        <div className="w-full md:w-96 border-b md:border-b-0 md:border-r p-4 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out">
          <div className="space-y-6">
            <PromptInput 
              generate={generate} 
              edit={edit}
              addSourceImage={addSourceImage}
              removeSourceImage={removeSourceImage}
              sourceImages={sourceImages}
              clearSourceImages={clearSourceImages}
              isLoading={isLoading} 
              model={selectedModel.id} 
              size={size} 
              quality={quality} 
              negativePrompt={negativePrompt}
              temperature={temperature}
              backgroundSetting={backgroundSetting}
              quantity={quantity}
            />
            <ApiKeySettings />
            <SettingsPanel 
              size={size}
              onSizeChange={setSize}
              quantity={quantity}
              onQuantityChange={setQuantity}
              quality={quality}
              onQualityChange={setQuality}
              selectedModel={selectedModel}
            />
            <AdvancedOptions 
              negativPrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              selectedModel={selectedModel}
              backgroundSetting={backgroundSetting}
              onBackgroundSettingChange={setBackgroundSetting}
              moderation={moderation}
              onModerationChange={setModeration}
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              outputCompression={outputCompression}
              onOutputCompressionChange={setOutputCompression}
            />
            <div className="flex justify-end">
              <KeyboardShortcuts />
            </div>
          </div>
        </div>
        {/* Main Content: below sidebar on mobile, right on desktop */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
          <ImageGrid 
            images={images} 
            favorites={favorites} 
            onToggleFavorite={toggleFavorite}
            onDelete={handleDeleteImage}
            addSourceImage={addSourceImage}
          />
        </div>
      </main>
    </div>
  );
}

// Wrap the page in ApiKeyProvider
export default function App() {
  return (
    <ApiKeyProvider>
      <Home />
    </ApiKeyProvider>
  );
}
