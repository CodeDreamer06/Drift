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
  
  // API key context
  const { getAvailableKey, isAllLimited, markUsage } = useApiKey();
  
  // Hooks
  const { isLoading, images, setImages, generate } = useGeneration();
  const { favorites, toggleFavorite } = useFavorites();
  
  // Delete image handler
  const handleDeleteImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };
  
  // Handle prompt submission
  const handlePromptSubmit = async (prompt: string) => {
    if (isAllLimited()) {
      alert('All API keys have reached the 5 requests/minute limit. Please wait or add more keys.');
      return;
    }
    // Always use a valid size for the selected model
    let validSize = size;
    const modelId = selectedModel.id;
    if (modelId === "gpt-image-1") {
      const allowed = ["1024x1024", "1024x1536", "1536x1024"];
      validSize = allowed.includes(size) ? size : allowed[0];
    } else if (modelId.toLowerCase().includes("flux")) {
      const allowed = [
        "2752x1536", "1536x2752", "2048x2048", "3136x1344", "2496x1664", "1664x2496",
        "1856x2304", "2304x1856", "1344x3136"
      ];
      validSize = allowed.includes(size) ? size : allowed[0];
    }
    const apiKey = getAvailableKey();
    if (!apiKey) {
      alert('No available API key.');
      return;
    }
    await generate({
      prompt,
      model: selectedModel.id,
      size: validSize,
      quality,
      n: quantity,
      negativePrompt: negativePrompt || undefined,
      temperature,
      apiKey
    });
    markUsage(apiKey);
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
              onSubmit={handlePromptSubmit} 
              isLoading={isLoading} 
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
