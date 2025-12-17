
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

/**
 * Puter environment provides the API key automatically.
 * We create a new instance for each call as per guidelines.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const performVirtualTryOn = async (body: ImageData, outfit: ImageData): Promise<string> => {
  const ai = getAIClient();
  
  // Use 'gemini-2.5-flash-image' for Free Unlimited Nano Banana API on Puter
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
          text: `Sen profesyonel bir yapay zeka moda stilistisin. 
                 GÖREV: Gerçekçi bir sanal kıyafet denemesi gerçekleştir.
                 GİRDİ 1: Kişinin vücut/portre fotoğrafı.
                 GİRDİ 2: Bir kıyafet fotoğrafı.
                 
                 TALİMATLAR:
                 1. İkinci görseldeki kıyafeti, birinci görseldeki kişinin üzerine mükemmel şekilde giydir.
                 2. Kişinin yüzünü, ten rengini ve orijinal arka planı olduğu gibi koru.
                 3. Kıyafeti kişinin duruşuna ve vücut hatlarına göre uyarla.
                 4. Işık ve gölgeleri sahneye uygun şekilde ayarla.
                 5. Sonuç görsel olarak gerçekçi ve yüksek kalitede olmalıdır.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }

  throw new Error("Görsel oluşturulamadı. Lütfen fotoğrafların netliğinden emin olun.");
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
          text: `Görseli bu isteğe göre düzenle: ${prompt}. Kişiyi ve kıyafeti bozmadan sadece belirtilen değişikliği yap.`,
        },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }

  throw new Error("Düzenleme yapılamadı.");
};
