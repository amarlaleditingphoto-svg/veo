import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        data: base64String,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateVideo = async (
  imageFile: File,
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  // Initialize AI client inside the function to ensure it picks up the latest API Key
  // injected by the environment after selection.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  try {
    console.log("Starting generation...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image cinematically.",
      image: {
        imageBytes: imagePart.data,
        mimeType: imagePart.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '1080p', // Prefer high quality
        aspectRatio: aspectRatio,
      }
    });

    console.log("Operation created, polling...", operation);

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Polling status:", operation.metadata?.state);
    }

    if (operation.error) {
      throw new Error(operation.error.message || "Video generation failed");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("No video URI returned from the API.");
    }

    // Fetch the actual video content
    // We must append the API key to the download link as per documentation
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!response.ok) {
       throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Veo generation error:", error);
    // Handle the specific "Requested entity was not found" race condition/auth error
    if (error.message && error.message.includes("Requested entity was not found")) {
        throw new Error("AUTH_ERROR"); 
    }
    throw error;
  }
};