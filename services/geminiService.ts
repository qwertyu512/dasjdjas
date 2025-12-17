
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types.ts";

/**
 * Puter ortamı API anahtarını otomatik olarak enjekte eder.
 * Bu fonksiyon, Nano Banana özelliklerini kullanmak için SDK'yı hazırlar.
 */
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const performVirtualTryOn = async (body: ImageData, outfit: ImageData): Promise<string> => {
  const ai = getAIClient();
  
  // 'gemini-2.5-flash-image' Nano Banana serisinin görsel üretim/düzenleme modelidir.
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
                 2. Kişinin yüzünü, ten rengini, saçını ve orijinal arka planını aynen koru.
                 3. Kıyafeti kişinin duruşuna ve vücut hatlarına göre uyarla (photorealistic draping).
                 4. Işıklandırmayı ve gölgeleri sahneye uygun şekilde dengele.
                 5. Kıyafet dokusunu (kumaş, parlaklık vs.) koru.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
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
          text: `Görseli bu isteğe göre düzenle: ${prompt}. Kişiyi ve kıyafeti bozmadan arka plan veya ışıklandırma gibi detayları değiştir.`,
        },
      ],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Düzenleme başarısız oldu.");
};
