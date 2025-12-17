
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

/**
 * Initialize GoogleGenAI with process.env.API_KEY.
 * In the Puter environment, this key is managed automatically.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const performVirtualTryOn = async (body: ImageData, outfit: ImageData): Promise<string> => {
  const ai = getAIClient();
  
  // Using 'gemini-2.5-flash-image' which is the alias for 'nano banana'
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: body.base64.split(',')[1],
            mimeType: body.mimeType,
          },
        },
        {
          inlineData: {
            data: outfit.base64.split(',')[1],
            mimeType: outfit.mimeType,
          },
        },
        {
          text: `You are an elite AI Fashion Stylist. 
                 TASK: Perform a photorealistic virtual try-on.
                 INPUT 1: A person's body/portrait.
                 INPUT 2: A garment/outfit.
                 
                 INSTRUCTIONS:
                 1. Seamlessly overlay the garment from Input 2 onto the person in Input 1.
                 2. Preserve the person's facial features, skin tone, hair, and original background exactly.
                 3. Adjust the garment's shape to match the person's pose and body contours.
                 4. Match the lighting and shadows of the original scene for a natural look.
                 5. Ensure realistic fabric draping and texture.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Görsel oluşturulamadı. Lütfen daha net fotoğraflar deneyin.");
};

export const editImageWithPrompt = async (baseImage: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  const [mimeHeader, base64Data] = baseImage.split(';base64,');
  const mimeType = mimeHeader.split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `Refine the current image based on this request: ${prompt}. Maintain the person and the outfit, focus on lighting, background, or artistic style changes.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Düzenleme başarısız oldu.");
};
