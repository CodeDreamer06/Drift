import { ImageQuality, ImageSize } from "@/components/SettingsPanel";
import { toast } from "sonner";

// Removed hardcoded API key. Key will be injected at runtime from context/localStorage.
const VOID_AI_API_URL = "https://api.voidai.xyz/v1/images/generations";

export interface GenerationRequest {
  prompt: string;
  model: string;
  size: ImageSize;
  quality: ImageQuality;
  n: number;
  negativePrompt?: string;
  temperature?: number;
  apiKey?: string; // Added optional apiKey field
}

export interface GenerationResponse {
  data: {
    url?: string;
    b64_json?: string;
  }[];
  created: number;
  model: string;
}

// Convert base64 to Blob
const base64ToBlob = (base64: string): Blob => {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([arrayBuffer], { type: 'image/png' });
};

export const generateImages = async (request: GenerationRequest): Promise<GenerationResponse> => {
  try {
    // Prepare request body based on model type
    const requestBody: Record<string, string | number> = {
      model: request.model,
      prompt: request.prompt,
      size: request.size,
      n: request.n,
    };
    
    // Handle GPT Image 1 specific parameters
    if (request.model === "gpt-image-1") {
      // GPT Image 1 uses different quality values
      requestBody.quality = request.quality === "hd" ? "high" : request.quality;
    } else {
      // For other models, use the quality as provided
      requestBody.quality = request.quality;
    }
    if (request.negativePrompt) {
      requestBody.negative_prompt = request.negativePrompt;
    }
    if (request.temperature !== undefined) {
      requestBody.temperature = request.temperature;
    }

    // Get API key from request or from localStorage
    const apiKey = request.apiKey || localStorage.getItem("drift-api-key");
    if (!apiKey) {
      throw new Error("No API key set. Please set your API key in settings.");
    }
    
    const response = await fetch(VOID_AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const result = await response.json();

    // For GPT Image 1, convert base64 data to blob URLs
    if (request.model === "gpt-image-1" && result.data) {
      result.data = result.data.map((item: { url?: string; b64_json?: string }) => {
        if (item.b64_json) {
          const blob = base64ToBlob(item.b64_json);
          item.url = URL.createObjectURL(blob);
        }
        return item;
      });
    }
    return result;
  } catch (error) {
    console.error("Error generating images:", error);
    toast.error(error instanceof Error ? error.message : "Failed to generate images");
    throw error;
  }
};