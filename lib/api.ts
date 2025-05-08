import { ImageQuality, ImageSize } from "@/components/SettingsPanel";
import { toast } from "sonner";

// Removed hardcoded API key. Key will be injected at runtime from context/localStorage.
const VOID_AI_API_URL = "https://api.voidai.app/v1/images/generations";
const VOID_AI_EDIT_API_URL = "https://api.voidai.app/v1/images/edits";

export interface GenerationRequest {
  prompt: string;
  model: string;
  size: ImageSize;
  quality: ImageQuality;
  n: number;
  negativePrompt?: string;
  temperature?: number;
  apiKey?: string; // Added optional apiKey field
  background?: 'auto' | 'opaque' | 'transparent'; // Added background setting
}

export interface GenerationResponse {
  data: {
    url?: string;
    b64_json?: string;
  }[];
  created: number;
  model: string;
}

export interface EditRequest {
  prompt: string;
  model: string; // Model should be specified, e.g., "gpt-image-1"
  images: File[]; // Array of File objects for editing
  apiKey?: string;
  background?: 'auto' | 'opaque' | 'transparent'; // Added background setting
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

    // Add background setting ONLY for gpt-image-1
    if (request.model === "gpt-image-1" && request.background) {
      requestBody.background = request.background;
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

export const editImages = async (request: EditRequest): Promise<GenerationResponse> => {
  try {
    const formData = new FormData();
    formData.append("prompt", request.prompt);
    formData.append("model", request.model);

    // Debug: Log file info
    console.log("[editImages] request.images:", request.images.map(f => ({ name: f.name, type: f.type, size: f.size })));
    // Debug: Check if any file is empty or not an image
    request.images.forEach((imageFile, idx) => {
      if (!imageFile.type.startsWith('image/')) {
        console.warn(`[editImages] File at index ${idx} is not an image:`, imageFile);
      }
      if (imageFile.size === 0) {
        console.warn(`[editImages] File at index ${idx} is empty:`, imageFile);
      }
    });

    // Append each image file
    request.images.forEach((imageFile) => {
      formData.append("image", imageFile);
    });

    // Re-enabled optional fields
    if (request.background) {
      formData.append("background", request.background);
    }
    if (request.apiKey) {
      formData.append("apiKey", request.apiKey);
    }

    // Debug: Log FormData entries
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[editImages] FormData: ${key} = File(name=${value.name}, type=${value.type}, size=${value.size})`);
      } else {
        console.log(`[editImages] FormData: ${key} = ${value}`);
      }
    }

    // Get API key from request or from localStorage
    const apiKey = request.apiKey || localStorage.getItem("drift-api-key");
    if (!apiKey) {
      throw new Error("No API key set. Please set your API key in settings.");
    }

    const response = await fetch(VOID_AI_EDIT_API_URL, {
      method: "POST",
      headers: {
        // Content-Type is automatically set by the browser for FormData
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Body:", errorBody);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: GenerationResponse = await response.json();
    return result;

  } catch (error) {
    console.error("Error editing images:", error);
    toast.error(error instanceof Error ? error.message : "Failed to edit images");
    throw error;
  }
};